import { OpenQuestion } from './open-question';
import { CloseQuestion } from './close-question';

export class Test {
    openQuestions: OpenQuestion[] = [];
    closeQuestions: CloseQuestion[] = [];

    constructor(openQuestions: OpenQuestion[], closeQuestions: CloseQuestion[]){
        this.openQuestions = openQuestions;
        this.closeQuestions = closeQuestions;
    }
}