/*
 * law&orga - record and organization management software for refugee law clinics
 * Copyright (C) 2020  Dominik Walser
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

import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CollabSandboxService } from '../../services/collab-sandbox.service';
import { AppSandboxService } from '../../../core/services/app-sandbox.service';
import { SharedSandboxService } from '../../../shared/services/shared-sandbox.service';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-page-view',
  templateUrl: './page-view.component.html',
  styleUrls: ['./page-view.component.scss'],
})
export class PageViewComponent implements OnInit {
  id: number;

  constructor(
    private route: ActivatedRoute,
    private collabSB: CollabSandboxService,
    private appSB: AppSandboxService,
    private sharedSB: SharedSandboxService,
    private location: Location,
    private media: MediaMatcher
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
    });
    if (this.media.matchMedia('(max-width: 600px)').matches) {
      this.sharedSB.openConfirmDialog(
        {
          cancelLabel: 'back',
          confirmColor: 'warn',
          confirmLabel: 'I want to suffer',
          description: "Opening this on a smartphone doesn't make any sense",
          title: 'are you sure you want to do this?',
        },
        (result) => {
          if (!result) {
            this.location.back();
          }
        }
      );
    }
  }

  onAddDocumentClick(): void {
    this.collabSB.addNewCollabDocument(this.id);
  }
}
