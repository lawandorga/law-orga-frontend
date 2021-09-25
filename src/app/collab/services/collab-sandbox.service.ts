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

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { CollabState } from '../store/collab.reducers';
import {
  StartAddingCollabDocumentPermission,
  StartAddingDocument,
  StartDeletingCollabDocument,
  StartDeletingCollabDocumentPermission,
  StartLoadingAllDocuments,
  StartLoadingCollabDocumentPermissions,
  StartLoadingCollabPermissions,
} from '../store/collab.actions';
import { HttpClient } from '@angular/common/http';
import { SharedSandboxService } from '../../shared/services/shared-sandbox.service';
import { NameCollabDocument } from '../models/collab-document.model';
import { Observable } from 'rxjs';
import {
  GetCollabEditingApiUrl,
  GetCollabTextDocumentApiUrl,
  GetCollabTextDocumentVersionsApiUrl,
  GetCollabTextDocumentVersionsModelApiUrl,
} from '../../statics/api_urls.statics';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { HasPermission, Permission } from '../../core/models/permission.model';
import { CollabPermission } from '../models/collab_permission.model';

@Injectable({
  providedIn: 'root',
})
export class CollabSandboxService {
  constructor(
    private router: Router,
    private collabStore: Store<CollabState>,
    private http: HttpClient,
    private sharedSB: SharedSandboxService,
    private snackbackService: SnackbarService
  ) {}

  startLoadingAllDocuments(): void {
    this.collabStore.dispatch(new StartLoadingAllDocuments());
  }

  addNewCollabDocument(id?: number): void {
    this.sharedSB.openEditTextDialog(
      {
        short: true,
        descriptionLabel: 'name',
        saveLabel: 'create',
        title: 'add new document',
      },
      (result) => {
        if (result) {
          if (result.includes('/')) {
            this.snackbackService.showErrorSnackBar("document name can't contain /");
            return;
          }
          if (id) {
            this.getSingleDocumentById(id)
              .subscribe((parent: NameCollabDocument) => {
                result = `${parent.path}/${result}`;
                this.collabStore.dispatch(new StartAddingDocument({ path: result }));
              })
              .unsubscribe();
          } else {
            this.collabStore.dispatch(new StartAddingDocument({ path: result }));
          }
        }
      }
    );
  }

  getSingleDocumentById(id: number): Observable<NameCollabDocument> {
    return this.collabStore.pipe(select((state: any) => state.collab.all_documents[id]));
  }

  getAllDocuments(): Observable<NameCollabDocument[]> {
    return this.collabStore.pipe(select((state: any) => Object.values(state.collab.all_documents)));
  }

  getAllTreeDocuments(): Observable<NameCollabDocument[]> {
    return this.collabStore.pipe(select((state: any) => Object.values(state.collab.all_documents_tree)));
  }

  fetchTextDocument(id: number): Observable<any> {
    return this.http.get(GetCollabTextDocumentApiUrl(id));
  }

  fetchTextDocumentVersions(id: number): Observable<any> {
    return this.http.get(GetCollabTextDocumentVersionsApiUrl(id));
  }

  fetchTextDocumentVersion(version_id: number): Observable<any> {
    return this.http.get(GetCollabTextDocumentVersionsModelApiUrl(version_id));
  }

  startDeletingCollabDocument(id: number): void {
    this.collabStore.dispatch(new StartDeletingCollabDocument({ id }));
  }

  saveTextDocument(id: number, content: string, is_draft = false): void {
    this.http.post(GetCollabTextDocumentVersionsApiUrl(id), { content, is_draft }).subscribe((response) => {
      // check response?
      if (is_draft) {
        this.snackbackService.showSuccessSnackBar('document draft saved');
      } else {
        this.snackbackService.showSuccessSnackBar('document saved');
      }
    });
  }

  connectToEditingRoom(id: number): Observable<any> {
    return this.http.get(GetCollabEditingApiUrl(id));
  }

  closeEditingRoom(document_id: number): void {
    this.http.delete(GetCollabEditingApiUrl(document_id)).subscribe((res) => {});
  }

  startLoadingCollabDocumentPermission(document_id: number): void {
    this.collabStore.dispatch(new StartLoadingCollabDocumentPermissions({ id: document_id }));
  }

  startAddingCollabDocumentPermission(document_id: number, group_id: string, permission_id: string): void {
    this.collabStore.dispatch(new StartAddingCollabDocumentPermission({ document_id, group_id, permission_id }));
  }

  startLoadingCollabPermissions(): void {
    this.collabStore.dispatch(new StartLoadingCollabPermissions());
  }

  getCollabPermissions(): Observable<Permission[]> {
    return this.collabStore.pipe(select((state: any) => Object.values(state.collab.collab_permissions)));
  }

  getDocumentPermissions(): Observable<{
    general_permissions: HasPermission[];
    document_permissions: CollabPermission[];
  }> {
    return this.collabStore.pipe(select((state: any) => state.collab.document_permissions));
  }

  getDocumentPermissionsCollab(): Observable<CollabPermission[]> {
    return this.collabStore.pipe(select((state: any) => state.collab.document_permissions.collab_permissions));
  }

  getDocumentPermissionsGeneral(): Observable<HasPermission[]> {
    return this.collabStore.pipe(select((state: any) => state.collab.document_permissions.general_permissions));
  }

  startDeletingDocumentPermission(collab_document_permission_id: number): void {
    this.collabStore.dispatch(new StartDeletingCollabDocumentPermission({ collab_document_permission_id }));
  }
}
