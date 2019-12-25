import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HomePageComponent} from './home-page/home-page.component';
import {ApplicantListComponent} from './applicant-list/applicant-list.component';
import {RecruiterApplicantProfileComponent} from './recruiter-applicant-profile/recruiter-applicant-profile.component';
import {LinkGeneratorComponent} from './link-generator/link-generator.component';
import {CreateTestComponent} from './create-test/create-test.component';
import {FormsModule} from '@angular/forms';
import {RecruiterRoutingModule} from './recruiter.routing.module';
import {RecruiterNavigationComponent} from './recruiter-navigation/recruiter-navigation.component';
import {AppRecruiterComponent} from './app-recruiter/app-recruiter.component';
import { ShowAllTestsComponent } from './show-all-tests/show-all-tests.component';
import {CommonComponentsModule} from '../common-components/common-components.module';
import { ApplicantTestListComponent } from './applicant-test-list/applicant-test-list.component';



@NgModule({
  declarations: [
    HomePageComponent,
    ApplicantListComponent,
    RecruiterApplicantProfileComponent,
    LinkGeneratorComponent,
    CreateTestComponent,
    ShowAllTestsComponent,
    RecruiterNavigationComponent,
    AppRecruiterComponent,
    ApplicantTestListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RecruiterRoutingModule,
    CommonComponentsModule
  ]
})
export class RecruiterModule { }
