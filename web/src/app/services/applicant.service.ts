import { Injectable } from '@angular/core';
import { Applicant} from '../model/applicant';
import {Experience} from '../model/experience';
import {University} from '../model/university';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApplicantService {

  mockdata: Applicant[];

  constructor() {
    this.mockdata = new Array(new Applicant('1', 'Marian', 'Kowal', new Date(1998, 2, 20), 'Betonowa 10', 'Łódź', '90-116', 'marek@lowcaSzparek.com', '999666333',
      new Array(new Experience('Kinopol', 'Manadżer', '2018-2019'), new Experience('Biedronka', 'Magazynier', '2016-2018')),
      new Array(new University('Uniwersytet Łódzki', 'Informatyka', '2017-2020', 'lic')),
      'Jestem miłym i spokojnym człowiekiem. W wolnych chwilach słucham metalu i jem koty.', '/assets/gosciu.jpeg'),
      new Applicant('2', 'Zosia', 'Samosia', new Date(1988, 11, 30), 'Grzybowa 8A/12', 'Warszawa', '00-001', 'zoska@onet.com', '38192645',
        new Array(), new Array(), 'Może nie mam doświadczenia, ale potrafię polizać swój łokieć.', '/assets/zosia.jpg'),
      new Applicant('3', 'Anna', 'Fafińska', new Date(1970, 1, 11), 'Garbowska 100', 'Grzybowo', '16-200', 'fafik@o2.pl', '11192364',
        new Array(new Experience('LapyMati', 'Obsługa klienta', '1991-2019')),
        new Array(), 'Przez wiele lat pracowałam jako sprzedawca pamięci RAM na allegro, ale firma upadła przez fatalną obsługę klienta. Teraz jestem bezrobotna i desperacko potrzebuję pracy.', '/assets/indeks.jpeg'));
  }

  // supposed to return 10 of the latest added applicants
  getLatestApplicants(): Observable<Applicant[]> {
    return of(this.mockdata);
  }

  getApplicants(firstName: string, lastName: string, city: string): Observable<Applicant[]> {
    return of(new Array());
  }

  getApplicant(id: string): Observable<Applicant> {
    return of(this.mockdata.find(value => value.id === id));
  }

}
