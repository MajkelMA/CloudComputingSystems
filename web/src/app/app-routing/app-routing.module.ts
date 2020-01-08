import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import {ConfirmCodeComponent} from '../confirm-code/confirm-code.component';
import {ChangePasswordComponent} from '../change-password/change-password.component';
import {FillInfoComponent} from '../fill-info/fill-info.component';
import {AuthGuardService} from '../services/auth-guard.service';

const routes: Routes = [
  {
    path: 'applicant',
    loadChildren: () => import('../applicant/applicant.module').then(m => m.ApplicantModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'confirm',
    component: ConfirmCodeComponent
  },
  {
    path: 'recruiter',
    loadChildren: () => import('../recruiter/recruiter.module').then(m => m.RecruiterModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent
  },
  {
    path: 'register',
    component: FillInfoComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
