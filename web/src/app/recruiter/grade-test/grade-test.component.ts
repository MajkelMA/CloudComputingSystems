import { Component, OnInit } from '@angular/core';
import {TestInstance} from '../../model/test-instance';
import {ActivatedRoute, Router} from '@angular/router';
import {TestService} from '../../services/test.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {ApplicantService} from '../../services/applicant.service';

@Component({
  selector: 'app-grade-test',
  templateUrl: './grade-test.component.html',
  styleUrls: ['./grade-test.component.scss']
})
export class GradeTestComponent implements OnInit {

  test: TestInstance;
  applicantID;
  timestamp;
  valid = true;
  applicant;
  public sending = false;

  constructor(public route: ActivatedRoute, public testService: TestService, public router: Router, public applicantService: ApplicantService) { }

  ngOnInit() {
    this.route.paramMap.subscribe( value => {
      this.applicantID = value.get('id');
      this.timestamp = value.get('timestamp');

      this.applicantService.getApplicant(this.applicantID).subscribe(applicant => this.applicant = applicant);
      this.testService.getTestInstance(this.applicantID, this.timestamp).subscribe( result => {
        this.test = JSON.parse(JSON.stringify(result.body)) as TestInstance;
      });
    });
  }

  grade() {
    this.sending = true;
    this.validate().subscribe( res => {
      this.sending = false;
      if (res) {
        this.sending = true;
        this.testService.sendGradedTest(this.test).subscribe(result => {
          this.sending = false;
          if (result === 1) {
            this.router.navigateByUrl('/recruiter/applicant/' + this.applicantID);
          }
        });
      }
    });
  }

  validate() {
    return new Observable(observer => {
      this.test.openQuestions.forEach( question => {
        if (question.receivedScore < 0 || question.receivedScore > question.maxScore) {
          this.valid = false;
          observer.next(false);
          observer.complete();
        }
      });

      observer.next(true);
      observer.complete();
    });

  }

}
