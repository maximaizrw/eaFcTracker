
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase-config';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs } from 'firebase/firestore';
import { useToast } from './use-toast';
import { v4 as uuidv4 } from 'uuid';
import type { Player, PlayerCard, Position, AddRatingFormValues, EditCardFormValues, EditPlayerFormValues, TrainingBuild, League, Rating } from '@/lib/types';
import { normalizeText } from '@/lib/utils';


export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!db) {
      const errorMessage = "La configuración de Firebase no está completa. Revisa que las variables de entorno se hayan añadido correctamente.";
      setError(errorMessage);
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(collection(db, "eafc_players"), (snapshot) => {
      try {
        const playersData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                cards: (data.cards || []).map((card: any) => ({
                    ...card,
                    id: card.id || uuidv4(), // Ensure card has an ID
                    style: card.style || 'Básico',
                    league: card.league || 'Sin Liga',
                    imageUrl: card.imageUrl || '',
                    ratingsByPosition: card.ratingsByPosition || {},
                    trainingBuilds: card.trainingBuilds || {}
                })),
            } as Player;
        });
        setPlayers(playersData);
        setError(null);
      } catch (err) {
          console.error("Error processing players snapshot: ", err);
          setError("No se pudieron procesar los datos de los jugadores.");
          toast({
              variant: "destructive",
              title: "Error de Datos",
              description: "No se pudieron procesar los datos de los jugadores.",
          });
      } finally {
        setLoading(false);
      }
    }, (err) => {
        console.error("Error fetching players from Firestore: ", err);
        setError("No se pudo conectar a la base de datos para leer jugadores.");
        setPlayers([]);
        setLoading(false);
        toast({
            variant: "destructive",
            title: "Error de Conexión",
            description: "No se pudo conectar a la base de datos para leer jugadores."
        });
    });

    return () => unsub();
  }, [toast]);

  const addRating = async (values: AddRatingFormValues) => {
    const { playerName, cardName, position, rating, style, league, role } = values;
    let { playerId } = values;

    if (!db) {
        toast({ variant: "destructive", title: "Error de Conexión", description: "No se puede conectar a la base de datos." });
        return;
    }

    try {
      // Find player ignoring case and accents
      if (!playerId) {
        const normalizedPlayerName = normalizeText(playerName);
        const existingPlayer = players.find(p => normalizeText(p.name) === normalizedPlayerName);
        if (existingPlayer) {
          playerId = existingPlayer.id;
        }
      }

      if (playerId) {
        const playerRef = doc(db, 'eafc_players', playerId);
        const playerDoc = await getDoc(playerRef);
        if (!playerDoc.exists()) throw new Error("Player not found");
        
        const playerData = playerDoc.data() as Player;
        const newCards: PlayerCard[] = JSON.parse(JSON.stringify(playerData.cards || []));
        let card = newCards.find(c => normalizeText(c.name) === normalizeText(cardName));

        const newRating: Rating = { value: rating };
        if (role && role !== 'ninguno') {
          newRating.role = role;
        }

        if (card) {
          if (!card.ratingsByPosition) card.ratingsByPosition = {};
          if (!card.ratingsByPosition[position]) card.ratingsByPosition[position] = [];
          card.ratingsByPosition[position]!.push(newRating);
          card.league = league || card.league || 'Sin Liga';
        } else {
          card = { 
              id: uuidv4(), 
              name: cardName, 
              style: style, 
              league: league || 'Sin Liga',
              imageUrl: '', 
              ratingsByPosition: { [position]: [newRating] },
              trainingBuilds: {}
          };
          newCards.push(card);
        }
        await updateDoc(playerRef, { cards: newCards });
      } else {
        const newRating: Rating = { value: rating };
        if (role && role !== 'ninguno') {
          newRating.role = role;
        }

        const newPlayer = {
          name: playerName,
          cards: [{ 
              id: uuidv4(), 
              name: cardName, 
              style: style, 
              league: league || 'Sin Liga',
              imageUrl: '', 
              ratingsByPosition: { [position]: [newRating] },
              trainingBuilds: {}
          }],
        };
        await addDoc(collection(db, 'eafc_players'), newPlayer);
      }
      toast({ title: "Éxito", description: `La valoración para ${playerName} ha sido guardada.` });
    } catch (error) {
      console.error("Error adding rating: ", error);
      toast({ variant: "destructive", title: "Error al Guardar", description: "No se pudo guardar la valoración." });
    }
  };

  const editCard = async (values: EditCardFormValues) => {
    if (!db) return;
    const playerRef = doc(db, 'eafc_players', values.playerId);
    try {
      const playerDoc = await getDoc(playerRef);
      if (!playerDoc.exists()) throw new Error("Player not found");
      
      const playerData = playerDoc.data() as Player;
      const newCards = JSON.parse(JSON.stringify(playerData.cards || [])) as PlayerCard[];
      const cardToUpdate = newCards.find(c => c.id === values.cardId);

      if (cardToUpdate) {
          cardToUpdate.name = values.currentCardName;
          cardToUpdate.style = values.currentStyle;
          cardToUpdate.league = values.league || 'Sin Liga';
          cardToUpdate.imageUrl = values.imageUrl || '';
          
          await updateDoc(playerRef, { cards: newCards });
          toast({ title: "Carta Actualizada", description: "Los datos de la carta se han actualizado." });
      }
    } catch (error) {
      console.error("Error updating card: ", error);
      toast({ variant: "destructive", title: "Error al Actualizar", description: "No se pudieron guardar los cambios." });
    }
  };

  const editPlayer = async (values: EditPlayerFormValues) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'eafc_players', values.playerId), { name: values.currentPlayerName });
      toast({ title: "Jugador Actualizado", description: "El nombre del jugador se ha actualizado." });
    } catch (error) {
      console.error("Error updating player: ", error);
      toast({ variant: "destructive", title: "Error al Actualizar", description: "No se pudo guardar el cambio de nombre." });
    }
  };

  const deleteCard = async (playerId: string, cardId: string, position: Position) => {
    if (!db) return;
    const playerRef = doc(db, 'eafc_players', playerId);
    try {
      const playerDoc = await getDoc(playerRef);
      if (!playerDoc.exists()) throw new Error("Player not found");
      
      const playerData = playerDoc.data() as Player;
      const newCards: PlayerCard[] = JSON.parse(JSON.stringify(playerData.cards));
      const cardToUpdate = newCards.find(c => c.id === cardId);

      if (!cardToUpdate?.ratingsByPosition?.[position]) {
          toast({ variant: "destructive", title: "Error", description: "No se encontraron valoraciones para esta posición." });
          return;
      }
      
      delete cardToUpdate.ratingsByPosition[position];

      const hasRatingsLeft = Object.keys(cardToUpdate.ratingsByPosition).length > 0;
      
      const finalCards = hasRatingsLeft ? newCards.map(c => c.id === cardId ? cardToUpdate : c) : newCards.filter(c => c.id !== cardId);

      if (finalCards.length === 0) {
          await deleteDoc(playerRef);
          toast({ title: "Jugador Eliminado", description: `Se eliminaron las valoraciones de ${playerData.name} para ${position}, y como no tenía más cartas, fue eliminado.` });
      } else {
          await updateDoc(playerRef, { cards: finalCards });
          toast({ title: "Acción Completada", description: `Se eliminaron las valoraciones de ${playerData.name} para la posición ${position}.` });
      }
    } catch (error) {
        console.error("Error deleting position ratings: ", error);
        toast({ variant: "destructive", title: "Error al Eliminar", description: "No se pudo completar la acción." });
    }
  };

  const deleteRating = async (playerId: string, cardId: string, position: Position, ratingIndex: number) => {
    if (!db) return;
    const playerRef = doc(db, 'eafc_players', playerId);
    try {
      const playerDoc = await getDoc(playerRef);
      if (!playerDoc.exists()) throw new Error("Player not found");
      
      const playerData = playerDoc.data() as Player;
      const newCards = JSON.parse(JSON.stringify(playerData.cards)) as PlayerCard[];
      const card = newCards.find(c => c.id === cardId);
      
      if(card?.ratingsByPosition?.[position]) {
          card.ratingsByPosition[position]!.splice(ratingIndex, 1);
          if (card.ratingsByPosition[position]!.length === 0) {
              delete card.ratingsByPosition[position];
          }
          await updateDoc(playerRef, { cards: newCards });
          toast({ title: "Valoración Eliminada", description: "La valoración ha sido eliminada." });
      }
    } catch (error) {
        console.error("Error deleting rating: ", error);
        toast({ variant: "destructive", title: "Error al Eliminar", description: "No se pudo eliminar la valoración." });
    }
  };
  
  const saveTrainingBuild = async (playerId: string, cardId: string, position: Position, build: TrainingBuild) => {
    if (!db) return;
    const playerRef = doc(db, 'eafc_players', playerId);
    try {
        const playerDoc = await getDoc(playerRef);
        if (!playerDoc.exists()) {
            throw new Error("Player document not found!");
        }

        const playerData = playerDoc.data() as Player;
        const newCards = JSON.parse(JSON.stringify(playerData.cards || [])) as PlayerCard[];
        const cardToUpdate = newCards.find(c => c.id === cardId);

        if (cardToUpdate) {
            if (!cardToUpdate.trainingBuilds) {
                cardToUpdate.trainingBuilds = {};
            }
            cardToUpdate.trainingBuilds[position] = build;
            
            await updateDoc(playerRef, { cards: newCards });
            toast({ title: "Build Guardada", description: "La progresión de entrenamiento se ha guardado correctamente." });
        } else {
            throw new Error("Card not found in player data!");
        }
    } catch (error) {
        console.error("Error saving training build: ", error);
        toast({ variant: "destructive", title: "Error al Guardar", description: "No se pudo guardar la build de entrenamiento." });
    }
  };

  const downloadBackup = async () => {
    if (!db) return null;
    try {
      const playersCollection = collection(db, 'eafc_players');
      const playerSnapshot = await getDocs(playersCollection);
      return playerSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching players for backup: ", error);
      return null;
    }
  };

  return { players, loading, error, addRating, editCard, editPlayer, deleteCard, deleteRating, saveTrainingBuild, downloadBackup };
}
