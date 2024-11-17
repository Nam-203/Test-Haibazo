
  export interface Circle {
    id: number;
    number: number;
    position: {
      x: string;
      y: string;
    };
    active: boolean;
  }
  
  export interface GameBoardState {
    circleCount: number;
    time: number;
    circles: Circle[];
    nextNumber: number;
    status: string | null;
    isVisibility: boolean;
    autoPlay: boolean;
  }
  export interface UpdatedCircles {
    position: {
        x: number;
        y: number;
    };
    id: number;
    number: number;
    active: boolean;
}[]