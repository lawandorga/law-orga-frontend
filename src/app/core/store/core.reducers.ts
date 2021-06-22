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

import { ForeignUser, FullUser } from '../models/user.model';
import {
  ADD_SINGLE_HAS_PERMISSION,
  CoreActions,
  DECREMENT_NOTIFICATION_COUNTER,
  INCREMENT_NOTIFICATION_COUNTER,
  REMOVE_ACTUAL_HAS_PERMISSIONS,
  REMOVE_SINGLE_HAS_PERMISSION,
  RESET_RESULTS_LENGTH,
  SET_ACTUAL_HAS_PERMISSIONS,
  SET_ALL_PERMISSIONS,
  SET_GROUPS,
  SET_NOTIFICATIONS,
  SET_OTHER_USERS,
  SET_RESULTS_LENGTH,
  SET_RLC,
  SET_RLCS,
  SET_SPECIAL_FOREIGN_USER,
  SET_SPECIAL_GROUP,
  SET_SPECIAL_PERMISSION,
  SET_USER,
  SET_USER_PERMISSIONS,
  SET_USER_RECORD_STATES,
  SET_USER_STATES,
} from './core.actions';
import { HasPermission, Permission } from '../models/permission.model';
import { RestrictedRlc } from '../models/rlc.model';
import { getIdObjects, getObjectsByField } from '../../shared/other/reducer-helper';
import { FullGroup, RestrictedGroup } from '../models/group.model';

export interface CoreState {
  user: FullUser;
  other_users: { [id: number]: FullUser };
  all_permissions: { [id: number]: Permission };
  user_permissions: { [id: number]: HasPermission };
  groups: { [id: number]: RestrictedGroup };
  special_group: FullGroup;
  actual_has_permissions: { [id: number]: HasPermission };
  foreign_user: ForeignUser;
  rlc: RestrictedRlc;
  user_states: any;
  user_record_states: any;
  special_permission: Permission;
  rlcs: { [id: number]: RestrictedRlc };
  notifications: number;
  results_length: number;
}

const initialState: CoreState = {
  user: null,
  other_users: {},
  all_permissions: {},
  user_permissions: {},
  groups: {},
  special_group: null,
  actual_has_permissions: {},
  foreign_user: null,
  rlc: null,
  user_states: [],
  user_record_states: [],
  special_permission: null,
  rlcs: {},
  notifications: 0,
  results_length: 0,
};

export function coreReducer(state = initialState, action: CoreActions) {
  switch (action.type) {
    case ADD_SINGLE_HAS_PERMISSION:
      const hasPerm: HasPermission = action.payload;
      return {
        ...state,
        actual_has_permissions: {
          ...state.actual_has_permissions,
          [hasPerm.id]: hasPerm,
        },
      };
    case REMOVE_ACTUAL_HAS_PERMISSIONS:
      return {
        ...state,
        actual_has_permissions: {},
      };
    case REMOVE_SINGLE_HAS_PERMISSION:
      const hasPermissions = state.actual_has_permissions;
      delete hasPermissions[action.payload];

      return {
        ...state,
        actual_has_permissions: hasPermissions,
      };

    case SET_ACTUAL_HAS_PERMISSIONS:
      return {
        ...state,
        actual_has_permissions: getIdObjects(action.payload),
      };
    case SET_ALL_PERMISSIONS:
      return {
        ...state,
        all_permissions: getIdObjects(action.payload),
      };
    case SET_GROUPS:
      return {
        ...state,
        groups: getIdObjects(action.payload),
      };
    case SET_OTHER_USERS:
      return {
        ...state,
        other_users: getIdObjects(action.payload),
      };
    case SET_RLC:
      return {
        ...state,
        rlc: action.payload,
      };
    case SET_RLCS:
      return {
        ...state,
        rlcs: getIdObjects(action.payload),
      };
    case SET_SPECIAL_FOREIGN_USER:
      return {
        ...state,
        foreign_user: action.payload,
      };
    case SET_SPECIAL_GROUP:
      return {
        ...state,
        special_group: action.payload,
      };
    case SET_SPECIAL_PERMISSION:
      return {
        ...state,
        special_permission: action.payload,
      };
    case SET_USER:
      return {
        ...state,
        user: action.payload,
      };
    case SET_USER_PERMISSIONS:
      return {
        ...state,
        user_permissions: getIdObjects(action.payload),
      };
    case SET_USER_RECORD_STATES:
      return {
        ...state,
        user_record_states: getObjectsByField(action.payload, 'abbreviation'),
      };
    case SET_USER_STATES:
      return {
        ...state,
        user_states: getObjectsByField(action.payload, 'abbreviation'),
      };
    case SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload,
      };
    case INCREMENT_NOTIFICATION_COUNTER:
      return {
        ...state,
        notifications: state.notifications + 1,
      };
    case DECREMENT_NOTIFICATION_COUNTER:
      return {
        ...state,
        notifications: state.notifications - 1,
      };
    case RESET_RESULTS_LENGTH:
      return {
        ...state,
        results_length: 0,
      };
    case SET_RESULTS_LENGTH:
      return {
        ...state,
        results_length: action.payload,
      };
    default:
      return state;
  }
}
