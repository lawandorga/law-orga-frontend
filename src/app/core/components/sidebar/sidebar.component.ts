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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppSandboxService } from '../../services/app-sandbox.service';
import { FullUser } from '../../models/user.model';
import { CoreSandboxService } from '../../services/core-sandbox.service';
import { Store } from '@ngrx/store';
import {
  PERMISSION_ACCEPT_NEW_USERS_RLC,
  PERMISSION_CAN_ADD_RECORD_RLC,
  PERMISSION_CAN_CONSULT,
  PERMISSION_CAN_PERMIT_RECORD_PERMISSION_REQUESTS,
  PERMISSION_CAN_VIEW_PERMISSIONS_RLC,
  PERMISSION_CAN_VIEW_RECORDS,
  PERMISSION_PROCESS_RECORD_DELETION_REQUESTS,
} from '../../../statics/permissions.statics';
import {
  ACCEPT_NEW_USER_REQUESTS_FRONT_URL,
  DELETION_REQUESTS_FRONT_URL,
  LEGAL_NOTICE_FRONT_URL,
  PERMISSIONS_FRONT_URL,
  RECORD_POOL_FRONT_URL,
  RECORDS_ADD_FRONT_URL,
  RECORDS_FRONT_URL,
  RECORDS_PERMIT_REQUEST_FRONT_URL,
} from '../../../statics/frontend_links.statics';
import { Subscription } from 'rxjs';
import { Logout } from '../../store/auth/actions';
import { selectRemainingMinutes } from '../../store/auth/selectors';
import { IRlc } from '../../models/rlc.model';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  name = '';
  email = '';
  time = 0;

  timerCheckPermissions = null;
  timerLoadUnreadNotifications = null;
  checkPermissionInterval = 30000;
  checkNotificationsInterval = 15000;

  number_of_notifications = '0';

  legalNoticeUrl = LEGAL_NOTICE_FRONT_URL;

  show_tab_permissions = {
    records: false,
    add_record: false,
    record_permission_request: false,
    permissions: false,
    accept_new_user: false,
    process_deletion_requests: {
      record_documents: false,
      records: false,
    },
    record_pool: false,
  };

  sidebarItemsOrg = [
    {
      label: 'Records',
      icon: 'folder',
      link: '/records/',
    },
    {
      label: 'Create Record',
      icon: 'create_new_folder',
      link: '/records/add/',
    },
    {
      label: 'Record Pool',
      icon: 'library_books',
      link: '/records/record_pool/',
    },
    // {
    //   label: 'Profiles',
    //   icon: 'people_outline',
    //   link: '/profiles/',
    // },
    // {
    //   label: 'Groups',
    //   icon: 'group',
    //   link: '/groups/',
    // },
    {
      label: 'Files',
      icon: 'folder_open',
      link: '/files/',
    },
    {
      label: 'Collab',
      icon: 'article',
      link: 'collab',
    },
    {
      label: 'Admin',
      icon: 'lock',
      items: [
        {
          label: 'Records Admin',
          icon: 'folder',
          link: '/records/permit_requests',
        },
        {
          label: 'Statistics',
          icon: 'analytics',
          link: '/statistics/',
        },
        {
          label: 'Permissions',
          icon: 'vpn_key',
          link: '/permissions/',
        },
        {
          label: 'New Users',
          icon: 'person_add',
          link: '/new_user_requests/',
        },
      ],
    },
    {
      label: 'Settings',
      icon: 'settings',
      link: '/settings/',
    },
  ];
  actualSidebarItems = [];

  config = {
    // interfaceWithRoute: true,
    highlightOnSelect: true,
  };

  static removeLink(link: string, itemsToSearch): { removed: boolean; newItems; deleteMe: boolean } {
    for (const item of itemsToSearch) {
      if (item.link === link) {
        return {
          removed: true,
          newItems: itemsToSearch.filter((innerItem) => innerItem.link !== link),
          deleteMe: itemsToSearch.length < 2,
        };
      }
      if (item.items) {
        const result = this.removeLink(link, item.items);
        if (result.deleteMe) {
          return {
            removed: true,
            newItems: itemsToSearch.filter((innerItem) => innerItem !== item),
            deleteMe: itemsToSearch.length < 2,
          };
        }
        if (result.removed) {
          item.items = result.newItems;
          return {
            removed: true,
            newItems: itemsToSearch,
            deleteMe: false,
          };
        }
      }
    }
    return {
      removed: false,
      newItems: itemsToSearch,
      deleteMe: false,
    };
  }

  constructor(private router: Router, private appSB: AppSandboxService, private coreSB: CoreSandboxService, private store: Store) {
    this.actualSidebarItems = this.sidebarItemsOrg;
  }

  getTimeRemaining(): void {
    this.store.select(selectRemainingMinutes).subscribe((item) => (this.time = item));
    setTimeout(() => this.getTimeRemaining(), 10000);
  }

  ngOnInit() {
    this.getTimeRemaining();

    this.coreSB.hasPermissionFromStringForOwnRlc(PERMISSION_CAN_VIEW_RECORDS, (hasPermission) => {
      if (this.show_tab_permissions.records !== hasPermission) {
        this.show_tab_permissions.records = hasPermission;
        this.recheckSidebarItems();
      }
    });

    this.coreSB.hasPermissionFromStringForOwnRlc(PERMISSION_CAN_ADD_RECORD_RLC, (hasPermission) => {
      if (this.show_tab_permissions.add_record !== hasPermission) {
        this.show_tab_permissions.add_record = hasPermission;
        this.recheckSidebarItems();
      }
    });

    this.coreSB.hasPermissionFromStringForOwnRlc(PERMISSION_CAN_PERMIT_RECORD_PERMISSION_REQUESTS, (hasPermission) => {
      if (this.show_tab_permissions.record_permission_request !== hasPermission) {
        this.show_tab_permissions.record_permission_request = hasPermission;
        this.recheckSidebarItems();
      }
    });

    this.coreSB.hasPermissionFromStringForOwnRlc(PERMISSION_CAN_VIEW_PERMISSIONS_RLC, (hasPermission) => {
      if (this.show_tab_permissions.permissions !== hasPermission) {
        this.show_tab_permissions.permissions = hasPermission;
        this.recheckSidebarItems();
      }
    });

    this.coreSB.hasPermissionFromStringForOwnRlc(PERMISSION_ACCEPT_NEW_USERS_RLC, (hasPermission) => {
      if (this.show_tab_permissions.accept_new_user !== hasPermission) {
        this.show_tab_permissions.accept_new_user = hasPermission;
        this.recheckSidebarItems();
      }
    });

    this.coreSB.hasPermissionFromStringForOwnRlc(PERMISSION_PROCESS_RECORD_DELETION_REQUESTS, (hasPermission) => {
      if (this.show_tab_permissions.process_deletion_requests.records !== hasPermission) {
        this.show_tab_permissions.process_deletion_requests.records = hasPermission;
        this.recheckSidebarItems();
      }
    });

    this.coreSB.hasPermissionFromStringForOwnRlc(PERMISSION_CAN_CONSULT, (hasPermission) => {
      this.coreSB.getRlc().subscribe((rlc: IRlc) => {
        if (rlc && rlc.use_record_pool && hasPermission) {
          this.show_tab_permissions.record_pool = true;
          this.recheckSidebarItems();
        }
      });
    });
    this.recheckSidebarItems();

    this.subscriptions.push(
      this.coreSB.getUser().subscribe((user: FullUser) => {
        this.name = user ? user.name : '';
        this.email = user ? user.email : '';
      })
    );

    this.subscriptions.push(
      this.coreSB.getNotifications().subscribe((number_of_notifications: number) => {
        if (number_of_notifications !== null && number_of_notifications) this.number_of_notifications = number_of_notifications.toString();
      })
    );

    // this.timerCheckPermissions = setInterval(() => {
    //   this.coreSB.startCheckingUserHasPermissions();
    // }, this.checkPermissionInterval);
    this.recheckSidebarItems();

    // this.timerLoadUnreadNotifications = setInterval(() => {
    //   this.coreSB.startLoadingUnreadNotifications();
    // }, this.checkNotificationsInterval);
  }

  recheckSidebarItems() {
    let newSidebarItems = JSON.parse(JSON.stringify(this.sidebarItemsOrg));
    if (!this.show_tab_permissions.records) newSidebarItems = SidebarComponent.removeLink(RECORDS_FRONT_URL, newSidebarItems).newItems;
    if (!this.show_tab_permissions.add_record)
      newSidebarItems = SidebarComponent.removeLink(RECORDS_ADD_FRONT_URL, newSidebarItems).newItems;
    if (!this.show_tab_permissions.record_permission_request)
      newSidebarItems = SidebarComponent.removeLink(RECORDS_PERMIT_REQUEST_FRONT_URL, newSidebarItems).newItems;
    if (!this.show_tab_permissions.permissions)
      newSidebarItems = SidebarComponent.removeLink(PERMISSIONS_FRONT_URL, newSidebarItems).newItems;
    if (!this.show_tab_permissions.accept_new_user)
      newSidebarItems = SidebarComponent.removeLink(ACCEPT_NEW_USER_REQUESTS_FRONT_URL, newSidebarItems).newItems;
    if (
      !this.show_tab_permissions.process_deletion_requests.record_documents &&
      !this.show_tab_permissions.process_deletion_requests.records
    )
      newSidebarItems = SidebarComponent.removeLink(DELETION_REQUESTS_FRONT_URL, newSidebarItems).newItems;
    if (!this.show_tab_permissions.record_pool)
      newSidebarItems = SidebarComponent.removeLink(RECORD_POOL_FRONT_URL, newSidebarItems).newItems;
    this.actualSidebarItems = newSidebarItems;
  }

  logout(): void {
    this.store.dispatch(Logout());
  }

  selectedItem(event): void {
    void this.router.navigate([event.link]);
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }
}
