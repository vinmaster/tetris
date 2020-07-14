export interface User {
  userId: string;
  role: 'User' | 'Admin';
  username: string;
  usernameColor: string;
  pieceIndex: number;
  state: 'WAITING' | 'READY' | 'PLAYING' | 'PAUSE' | 'GAMEOVER';
}
