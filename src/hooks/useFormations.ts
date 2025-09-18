
'use client';

import { useState, useEffect } from 'react';
import { db, isConfigValid } from '@/lib/firebase-config';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, getDocs, arrayUnion, query, orderBy, getDoc } from 'firebase/firestore';
import { useToast } from './use-toast';
import { v4 as uuidv4 } from 'uuid';
import type { Tactic, MatchResult, AddMatchFormValues, AddTacticFormValues, EditTacticFormValues } from '@/lib/types';

export function useFormations() {
  const [formations, setFormations] = useState<Tactic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isConfigValid) {
      const errorMessage = "La configuración de Firebase no está completa. Revisa las variables de entorno.";
      setError(errorMessage);
      setLoading(false);
      return;
    }
    
    if (!db) {
      const errorMessage = "La conexión con la base de datos no se pudo establecer.";
      setError(errorMessage);
      setLoading(false);
      return;
    }

    const q = query(collection(db, "eafc_tactics"), orderBy("name", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      try {
        const formationsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
            } as Tactic;
        });
        setFormations(formationsData);
        setError(null);
      } catch (err) {
        console.error("Error processing formations snapshot: ", err);
        setError("No se pudieron procesar los datos de las formaciones.");
        toast({
          variant: "destructive",
          title: "Error de Datos",
          description: "No se pudieron procesar los datos de las formaciones.",
        });
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error("Error fetching formations from Firestore: ", err);
      setError("No se pudo conectar a la base de datos para leer formaciones.");
      setFormations([]);
      setLoading(false);
      toast({
          variant: "destructive",
          title: "Error de Conexión",
          description: "No se pudo conectar a la base de datos para leer formaciones."
      });
    });

    return () => unsub();
  }, [toast]);
  
  const addFormation = async (values: AddTacticFormValues) => {
    if (!db) return;
    try {
        const newTactic: Omit<Tactic, 'id'> = {
            name: values.name,
            detail: values.detail,
            formation: values.formation,
            style: values.style,
            defense: values.defense,
            code: values.code,
            matches: [],
        };
        await addDoc(collection(db, 'eafc_tactics'), newTactic);
        toast({ title: "Táctica Añadida", description: `La táctica "${values.name}" se ha guardado.` });
    } catch (error) {
        console.error("Error adding tactic: ", error);
        toast({
            variant: "destructive",
            title: "Error al Guardar",
            description: `No se pudo guardar la táctica.`,
        });
    }
  };
  
  const editFormation = async (values: EditTacticFormValues) => {
    if (!db) return;
    try {
      const formationRef = doc(db, 'eafc_tactics', values.id);
      await updateDoc(formationRef, {
        name: values.name,
        detail: values.detail,
        formation: values.formation,
        style: values.style,
        defense: values.defense,
        code: values.code,
      });
      toast({ title: "Táctica Actualizada", description: `La táctica "${values.name}" ha sido actualizada.` });
    } catch (error) {
      console.error("Error updating tactic: ", error);
      toast({
        variant: "destructive",
        title: "Error al Actualizar",
        description: `No se pudo actualizar la táctica.`,
      });
    }
  };


  const addMatchResult = async (values: AddMatchFormValues) => {
    if(!db) return;
    try {
      const formationRef = doc(db, 'eafc_tactics', values.formationId);
      const newResult: MatchResult = {
        id: uuidv4(),
        goalsFor: values.goalsFor,
        goalsAgainst: values.goalsAgainst,
        date: new Date().toISOString(),
      };
      await updateDoc(formationRef, {
        matches: arrayUnion(newResult)
      });
      toast({ title: "Resultado Añadido", description: `Marcador ${values.goalsFor} - ${values.goalsAgainst} guardado.` });
    } catch (error) {
      console.error("Error adding match result:", error);
      toast({
        variant: "destructive",
        title: "Error al Registrar",
        description: "No se pudo guardar el resultado del partido.",
      });
    }
  };

  const deleteFormation = async (formation: Tactic) => {
    if(!db) return;
    try {
      await deleteDoc(doc(db, 'eafc_tactics', formation.id));
      toast({ title: "Táctica Eliminada", description: "La táctica y sus estadísticas han sido eliminadas." });
    } catch (error) {
      console.error("Error deleting formation:", error);
      toast({
        variant: "destructive",
        title: "Error al Eliminar",
        description: "No se pudo eliminar la formación.",
      });
    }
  };

  const deleteMatchResult = async (formationId: string, matchId: string) => {
    if (!db) return;
    const formationRef = doc(db, 'eafc_tactics', formationId);
    try {
        const formationSnap = await getDoc(formationRef);
        if (formationSnap.exists()) {
            const formationData = formationSnap.data() as Tactic;
            const updatedMatches = formationData.matches.filter(match => match.id !== matchId);
            await updateDoc(formationRef, { matches: updatedMatches });
            toast({ title: "Resultado Eliminado", description: "El resultado del partido ha sido eliminado." });
        }
    } catch (error) {
        console.error("Error deleting match result: ", error);
        toast({
            variant: "destructive",
            title: "Error al Eliminar",
            description: "No se pudo eliminar el resultado del partido.",
        });
    }
  };

  const downloadBackup = async () => {
    if (!db) return null;
    try {
      const formationsCollection = collection(db, 'eafc_tactics');
      const formationSnapshot = await getDocs(formationsCollection);
      return formationSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching formations for backup: ", error);
      return null;
    }
  };

  return { formations, loading, error, addFormation, editFormation, addMatchResult, deleteFormation, deleteMatchResult, downloadBackup };
}
