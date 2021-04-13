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

import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';

import { AppSandboxService } from '../../../core/services/app-sandbox.service';
import {
  START_LOADING_CLIENT_POSSIBILITIES,
  START_LOADING_RECORD_DELETION_REQUESTS,
  START_LOADING_RECORD_PERMISSION_REQUESTS,
  START_LOADING_RECORD_POOL,
  START_LOADING_RECORD_STATICS,
  START_LOADING_RECORDS,
  START_LOADING_SPECIAL_RECORD,
  StartLoadingClientPossibilities,
  StartLoadingRecords,
  StartLoadingSpecialRecord,
} from '../actions/records-start.actions';
import {
  CLIENTS_BY_BIRTHDAY_API_URL,
  GetRecordsSearchApiURL,
  GetSpecialRecordApiURL,
  RECORD_PERMISSIONS_LIST_API_URL,
  RECORDS_STATICS_API_URL,
  RECORDS_API_URL,
  RECORD_DELETIONS_API_URL,
  RECORD_POOL_API_URL,
  GetFullRecordSearchApiUrl,
} from '../../../statics/api_urls.statics';
import { FullRecord, RestrictedRecord } from '../../models/record.model';
import {
  SET_CONSULTANTS,
  SET_COUNTRY_STATES,
  SET_ORIGIN_COUNTRIES,
  SET_POOL_CONSULTANTS,
  SET_POOL_RECORDS,
  SET_POSSIBLE_CLIENTS,
  SET_RECORD_DELETION_REQUESTS,
  SET_RECORD_DOCUMENT_TAGS,
  SET_RECORD_PERMISSION_REQUESTS,
  SET_RECORD_STATES,
  SET_RECORD_TAGS,
  SET_RECORDS,
  SET_SPECIAL_CLIENT,
  SET_SPECIAL_ORIGIN_COUNTRY,
  SET_SPECIAL_RECORD,
  SET_SPECIAL_RECORD_DOCUMENTS,
  SET_SPECIAL_RECORD_MESSAGES,
  SET_SPECIAL_RECORD_REQUEST_STATE,
  SET_USERS_POOL_ENLISTINGS,
} from '../actions/records-set.actions';
import { RestrictedUser } from '../../../core/models/user.model';
import { OriginCountry } from '../../models/country.model';
import { Tag } from '../../models/tag.model';
import { CoreSandboxService } from '../../../core/services/core-sandbox.service';
import { FullClient } from '../../models/client.model';
import { RecordDocument } from '../../models/record_document.model';
import { RecordMessage } from '../../models/record_message.model';
import { RESET_FULL_CLIENT_INFORMATION } from '../actions/records.actions';
import { RecordPermissionRequest } from '../../models/record_permission.model';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { State } from '../../../core/models/state.model';
import { RecordDeletionRequest } from '../../models/record_deletion_request.model';
import { SET_RESULTS_LENGTH } from '../../../core/store/core.actions';
import { SearchParamsInterface } from '../../../shared/interfaces/search_params.interface';

@Injectable()
export class RecordsLoadingEffects {
  constructor(
    private actions: Actions,
    private http: HttpClient,
    private appSB: AppSandboxService,
    private snackbarService: SnackbarService
  ) {}

  @Effect()
  startLoadingRecords = this.actions.pipe(
    ofType(START_LOADING_RECORDS),
    map((action: StartLoadingRecords) => {
      return action.payload;
    }),
    switchMap((searchParamsInterface: SearchParamsInterface) => {
      const url = GetFullRecordSearchApiUrl(searchParamsInterface);
      return from(
        this.http.get(url).pipe(
          catchError((error) => {
            this.snackbarService.showErrorSnackBar(`error at loading records: ${error.error.detail}`);
            return [];
          }),
          mergeMap((response) => {
            const loadedRecords: Array<RestrictedRecord> = [];
            Object.values(response.results).map((record) => {
              if (record['access'] === 1) {
                loadedRecords.push(FullRecord.getFullRecordFromJson(record));
              } else {
                loadedRecords.push(RestrictedRecord.getRestrictedRecordFromJson(record));
              }
            });
            return [
              { type: SET_RECORDS, payload: loadedRecords },
              { type: SET_RESULTS_LENGTH, payload: response.count },
            ];
          })
        )
      );
    })
  );

  @Effect()
  startLoadingRecordStatics = this.actions.pipe(
    ofType(START_LOADING_RECORD_STATICS),
    switchMap(() => {
      if (this.appSB.isAuthenticated()) {
        return from(
          this.http.get(RECORDS_STATICS_API_URL).pipe(
            catchError((error) => {
              this.snackbarService.showErrorSnackBar(`error at loading record statics: ${error.error.detail}`);
              return [];
            }),
            mergeMap(
              (response: {
                consultants: any;
                countries: any;
                record_tags: any;
                record_states: any;
                country_states: any;
                record_document_tags: any;
              }) => {
                return [
                  {
                    type: SET_CONSULTANTS,
                    payload: RestrictedUser.getRestrictedUsersFromJsonArray(response.consultants),
                  },
                  {
                    type: SET_ORIGIN_COUNTRIES,
                    payload: OriginCountry.getOriginCountriesFromJsonArray(response.countries),
                  },
                  {
                    type: SET_RECORD_TAGS,
                    payload: Tag.getTagsFromJsonArray(response.record_tags),
                  },
                  {
                    type: SET_RECORD_DOCUMENT_TAGS,
                    payload: Tag.getTagsFromJsonArray(response.record_document_tags),
                  },
                  {
                    type: SET_RECORD_STATES,
                    payload: State.getStatesFromJsonArray(response.record_states),
                  },
                  {
                    type: SET_COUNTRY_STATES,
                    payload: State.getStatesFromJsonArray(response.country_states),
                  },
                ];
              }
            )
          )
        );
      }
      return [];
    })
  );

  @Effect()
  startLoadingClientPossibilities = this.actions.pipe(
    ofType(START_LOADING_CLIENT_POSSIBILITIES),
    map((action: StartLoadingClientPossibilities) => {
      return action.payload;
    }),
    switchMap((birthday: Date) => {
      const privateKeyPlaceholder = AppSandboxService.getPrivateKeyPlaceholder();
      return from(
        this.http
          .post(
            CLIENTS_BY_BIRTHDAY_API_URL,
            {
              birthday: CoreSandboxService.transformDateToString(birthday),
            },
            privateKeyPlaceholder
          )
          .pipe(
            catchError((error) => {
              this.snackbarService.showErrorSnackBar(`error at loading client possibilities: ${error.error.detail}`);
              return [];
            }),
            mergeMap((response) => {
              const clients = FullClient.getFullClientsFromJsonArray(response);
              return [{ type: SET_POSSIBLE_CLIENTS, payload: clients }];
            })
          )
      );
    })
  );

  @Effect()
  startLoadingSpecialRecord = this.actions.pipe(
    ofType(START_LOADING_SPECIAL_RECORD),
    map((action: StartLoadingSpecialRecord) => {
      return action.payload;
    }),
    switchMap((id: string) => {
      return from(
        this.http.get(GetSpecialRecordApiURL(id), AppSandboxService.getPrivateKeyPlaceholder()).pipe(
          catchError((error) => {
            this.snackbarService.showErrorSnackBar(`error at loading special record: ${error.error.detail}`);
            return [];
          }),
          mergeMap((response: any) => {
            if (response.client) {
              const record: FullRecord = FullRecord.getFullRecordFromJson(response.record);
              const client: FullClient = FullClient.getFullClientFromJson(response.client);

              const originCountry: OriginCountry = OriginCountry.getOriginCountryFromJson(response.origin_country);

              const record_documents = RecordDocument.getRecordDocumentsFromJsonArray(response.record_documents);

              const record_messages = RecordMessage.getRecordMessagesFromJsonArray(response.record_messages);

              return [
                {
                  type: SET_SPECIAL_RECORD,
                  payload: record,
                },
                {
                  type: SET_SPECIAL_CLIENT,
                  payload: client,
                },
                {
                  type: SET_SPECIAL_ORIGIN_COUNTRY,
                  payload: originCountry,
                },
                {
                  type: SET_SPECIAL_RECORD_DOCUMENTS,
                  payload: record_documents,
                },
                {
                  type: SET_SPECIAL_RECORD_MESSAGES,
                  payload: record_messages,
                },
              ];
            } else {
              const record = RestrictedRecord.getRestrictedRecordFromJson(response.record);
              return [
                { type: SET_SPECIAL_RECORD, payload: record },
                {
                  type: SET_SPECIAL_RECORD_REQUEST_STATE,
                  payload: response.request_state,
                },
              ];
            }
          })
        )
      );
    })
  );

  @Effect()
  startLoadingRecordPermissionRequests = this.actions.pipe(
    ofType(START_LOADING_RECORD_PERMISSION_REQUESTS),
    switchMap(() => {
      return from(
        this.http.get(RECORD_PERMISSIONS_LIST_API_URL).pipe(
          catchError((error) => {
            this.snackbarService.showErrorSnackBar(`error at loading record permission list: ${error.error.detail}`);
            return [];
          }),
          mergeMap((response) => {
            return [
              {
                type: SET_RECORD_PERMISSION_REQUESTS,
                payload: RecordPermissionRequest.getRecordPermissionRequestsFromJsonArray(response),
              },
            ];
          })
        )
      );
    })
  );

  @Effect()
  startLoadingRecordDeletionRequests = this.actions.pipe(
    ofType(START_LOADING_RECORD_DELETION_REQUESTS),
    switchMap(() => {
      return from(
        this.http.get(RECORD_DELETIONS_API_URL).pipe(
          catchError((error) => {
            this.snackbarService.showErrorSnackBar(`error at loading record deletion list: ${error.error.detail}`);
            return [];
          }),
          mergeMap((response) => {
            return [
              {
                type: SET_RECORD_DELETION_REQUESTS,
                payload: RecordDeletionRequest.getRecordDeletionRequestsFromJsonArray(response),
              },
            ];
          })
        )
      );
    })
  );

  @Effect()
  startLoadingRecordPool = this.actions.pipe(
    ofType(START_LOADING_RECORD_POOL),
    switchMap(() => {
      return from(
        this.http.get(RECORD_POOL_API_URL).pipe(
          catchError((error) => {
            this.snackbarService.showErrorSnackBar(`error at loading record pool: ${error.error.detail}`);
            return [];
          }),
          mergeMap((response) => {
            if (response['type'] === 'records') {
              return [
                {
                  type: SET_POOL_RECORDS,
                  payload: response['entries'].length,
                },
              ];
            } else if (response['type'] === 'consultants') {
              return [
                {
                  type: SET_POOL_CONSULTANTS,
                  payload: response['entries'].length,
                },
                {
                  type: SET_USERS_POOL_ENLISTINGS,
                  payload: response.number_of_own_enlistings,
                },
              ];
            }
            return [];
          })
        )
      );
    })
  );
}
