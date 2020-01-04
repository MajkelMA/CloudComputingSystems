export class SolvedOpenQuestion {
  question: string;
  public answer: string;
  maxScore: number;
  receivedScore: number;


  constructor(question: string, answer: string, maxScore: number, receivedScore: number) {
    this.question = question;
    this.answer = answer;
    this.maxScore = maxScore;
    this.receivedScore = receivedScore;
  }
}
