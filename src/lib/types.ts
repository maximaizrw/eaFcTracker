export interface Idea {
  id: string;
  text: string;
  rating: number;
  subTasks: SubTask[];
}

export interface SubTask {
  id:string;
  text: string;
  resources: Resource[];
  isLoadingResources: boolean;
}

export interface Resource {
  id: string;
  text: string;
}
