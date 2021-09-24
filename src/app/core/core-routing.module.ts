/*
 * law&orga - record and organization management software for refugee law clinics
 * Copyright (C) 2019  Dominik Walser
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>
 */

import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuardService } from './services/auth-guard.service';
import { DashboardComponent } from './pages/Dashboard/dashboard.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ProfilesListComponent } from './pages/profiles-list/profiles-list.component';
import { ForeignProfileComponent } from './pages/foreign-profile/foreign-profile.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';
import { GroupsListComponent } from './pages/groups-list/groups-list.component';
import { GroupComponent } from './pages/group/group.component';
import { PermissionListComponent } from './pages/permission-list/permission-list.component';
import { NewUserRequestsComponent } from './pages/new-user-requests/new-user-requests.component';
import { LegalNoticeComponent } from './pages/legal-notice/legal-notice.component';
import { PrivacyStatementComponent } from './pages/privacy-statement/privacy-statement.component';
import { NotificationGroupsListComponent } from './pages/notification-groups-list/notification-groups-list.component';
import { UnsavedGuardService } from './services/unsaved-guard.service';
import { StatisticsPageComponent } from './pages/statistics-page/statistics-page.component';
import { STATISTICS_FRONT_URL } from '../statics/frontend_links.statics';
import { ArticleComponent } from './pages/article/article.component';
import { SettingsComponent } from './pages/settings/settings.component';

const apiRoutes: Routes = [
  {
    path: 'profiles',
    pathMatch: 'full',
    component: ProfilesListComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'settings',
    pathMatch: 'full',
    component: SettingsComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'dashboard',
    pathMatch: 'full',
    component: DashboardComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'profiles/:id',
    component: ForeignProfileComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'groups',
    pathMatch: 'full',
    component: GroupsListComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'groups/:id',
    component: GroupComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'permissions',
    pathMatch: 'full',
    component: PermissionListComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'new_user_requests',
    component: NewUserRequestsComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'notifications',
    component: NotificationGroupsListComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: STATISTICS_FRONT_URL,
    component: StatisticsPageComponent,
    canActivate: [AuthGuardService],
  },
  // without access control
  { path: 'login', component: LoginComponent },
  { path: '', component: LoginComponent },
  { path: 'articles/:id', component: ArticleComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:userid/:token', component: ResetPasswordComponent },
  { path: 'activate-account/:userid/:token', component: LoginComponent },
  { path: 'legal_notice', component: LegalNoticeComponent },
  { path: 'privacy_statement', component: PrivacyStatementComponent },
];

@NgModule({
  imports: [RouterModule.forChild(apiRoutes)],
  exports: [RouterModule],
  providers: [AuthGuardService, UnsavedGuardService],
})
export class CoreRoutingModule {}
