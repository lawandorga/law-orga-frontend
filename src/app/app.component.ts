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

import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthState } from './core/store/auth/reducers';
import { Observable } from 'rxjs';
import { AppSandboxService } from './core/services/app-sandbox.service';
import { LEGAL_NOTICE_FRONT_URL, MAIN_PAGE_FRONT_URL, PRIVACY_STATEMENT_FRONT_URL } from './statics/frontend_links.statics';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('snav')
  snav;

  authenticated: Observable<boolean>;

  privacyStatementUrl = PRIVACY_STATEMENT_FRONT_URL;
  legalNoticeUrl = LEGAL_NOTICE_FRONT_URL;

  constructor(private router: Router, private appSB: AppSandboxService, private store: Store<AuthState>) {
    this.authenticated = store.select((state: AuthState) => state.authenticated);
  }

  ngOnInit(): void {
    // allow controlling snav in AppSandboxService
    setTimeout(() => {
      this.appSB.setNavbar(this.snav);
    }, 5);
  }

  toggleNav(): void {
    if (this.snav) this.snav.toggle();
  }

  redirectToMainPage(): void {
    this.router.navigate([MAIN_PAGE_FRONT_URL]);
  }
}
