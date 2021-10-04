import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthService } from './auth/services/auth.service';
import { Logout } from './auth/store/actions';
import { IRlc } from './core/models/rlc.model';
import { IUser } from './core/models/user.model';
import { AppSandboxService } from './core/services/app-sandbox.service';
import { PERMISSION_ACCESS_TO_FILES_RLC, PERMISSION_CAN_VIEW_RECORDS } from './statics/permissions.statics';

interface SidebarItem {
  label: string;
  icon: string;
  link: string;
  notifications?: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  authenticated = false;
  userMenuOpen = false;
  mobileMenuOpen = false;
  user: IUser = { name: '', email: '' };
  notifications = '0';

  show_tab_permissions = {
    records: false,
    add_record: false,
    record_pool: false,
  };

  allSidebarItems: SidebarItem[] = [
    {
      label: 'Records',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />',

      link: '/records/',
    },
    {
      label: 'Files',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />',
      link: '/files/',
    },
    {
      label: 'Collab',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />',
      link: 'collab',
    },
    {
      label: 'Statistics',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />',
      link: '/statistics/',
    },
    {
      label: 'Admin',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />',
      link: '/admin/',
      notifications: 0,
    },
    {
      label: 'Help',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />',
      link: '/help/',
    },
    // {
    //   label: 'Imprint',
    //   icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />',
    //   link: '/imprint/',
    // },
    // {
    //   label: 'Privacy',
    //   icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />',
    //   link: 'http://rlc-deutschland.de/datenschutz/',
    // },
  ];
  sidebarItems: SidebarItem[] = [];
  permissions: string[];
  rlc: IRlc;

  constructor(private appSB: AppSandboxService, private authService: AuthService, private store: Store) {}

  ngOnInit(): void {
    this.appSB.startApp();
    this.appSB.getUser().subscribe((user: IUser) => (this.user = user));
    this.authService.getAuthenticated().subscribe((authenticated) => (this.authenticated = authenticated));
    this.sidebarItems = this.allSidebarItems;
    this.appSB.getNotifications().subscribe((number_of_notifications: number) => (this.notifications = number_of_notifications.toString()));
    this.appSB.getRlc().subscribe((rlc: IRlc) => {
      this.rlc = rlc;
      this.recheckSidebarItems();
    });
    this.appSB.getUserPermissions().subscribe((permissions: string[]) => {
      this.permissions = permissions;
      this.recheckSidebarItems();
    });
    this.appSB
      .getAdminNotifications()
      .subscribe((notifications) => (this.sidebarItems[this.sidebarItems.length - 2].notifications = notifications));
    this.recheckSidebarItems();
  }

  recheckSidebarItems(): void {
    this.sidebarItems = this.allSidebarItems;
    if (this.permissions && !this.permissions.includes(PERMISSION_CAN_VIEW_RECORDS))
      this.sidebarItems = this.sidebarItems.filter((item) => item.link !== '/records/');
    if (this.permissions && !this.permissions.includes(PERMISSION_ACCESS_TO_FILES_RLC))
      this.sidebarItems = this.sidebarItems.filter((item) => item.link !== '/files/');
  }

  logout(): void {
    this.userMenuOpen = false;
    this.store.dispatch(Logout());
  }
}
