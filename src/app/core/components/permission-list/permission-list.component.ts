import { Component } from '@angular/core';

@Component({
  selector: 'app-permission-list',
  templateUrl: './permission-list.component.html',
})
export class PermissionListComponent {
  permissions = [
    {
      name: 'accept_new_users_rlc',
      explanation: 'Zulassung neuer Nutzer*innen',
      group: 'Administrator*innen / Vorstand',
    },
    {
      name: 'access_to_files_rlc',
      explanation: 'Genereller Zugriff aufs Dateimanagement (Files)',
      group: 'Alle Nutzer*innen',
    },
    {
      name: 'add_record_rlc',
      explanation: 'Akten anlegen',
      group: 'Berater*innen',
    },
    {
      name: 'can_consult',
      explanation: 'Nutzer*in kann als „Consultant“ (Berater*in) eingetragen werden',
      group: 'Berater*innen',
    },
    {
      name: 'manage_collab_document_permissons_rlc',
      explanation: 'Verwaltung der Berechtigungen für Collab',
      group: 'Administrator*innen/ Vorstand',
    },
    {
      name: 'manage_folder_permissions_rlc',
      explanation: 'Verwaltung der Berechtigungen im Dateimanagement',
      group: 'Administrator*innen / Vorstand',
    },
    {
      name: 'manage_group',
      explanation: 'Verwaltung einzelner Gruppe',
      group: 'Entsprechendes Ressort',
    },
    {
      name: 'manage_groups_rlc',
      explanation: 'Verwaltung aller Gruppen',
      group: 'Administrator*innen / Vorstand',
    },
    {
      name: 'manage_permissions_rlc',
      explanation: 'Allgemeine Berechtigungsverwaltung',
      group: 'Administrator*innen / Vorstand',
    },
    {
      name: 'manage_users',
      explanation: 'Verwaltung der Nutzer*innen',
      group: 'Administrator*innen / Vorstand',
    },
    {
      name: 'permit_record_permission_requests_rlc',
      explanation: 'Bearbeitung von Aktenzugriffsanfragen',
      group: 'Administrator*innen / Vorstand',
    },
    {
      name: 'process_record_deletion_requests',
      explanation: 'Bearbeitung von Aktenlöschanfragen',
      group: 'Administrator*innen / Vorstand',
    },
    {
      name: 'read_all_collab_documents_rlc',
      explanation: 'Zugriff auf alle Collab Dokumente',
      group: 'Aller Nutzer*innen',
    },
    {
      name: 'read_all_folders_rlc',
      explanation: 'Genereller Lesezugriff auf alle Ordner im Dateimanagement',
      group: 'Administrator*innen / Vorstand',
    },
    {
      name: 'view_permissions_rlc',
      explanation: 'Sichtbarkeit von allgemeinen Berechtigungen',
      group: 'Administrator*innen / Vorstand',
    },
    {
      name: 'view_records_full_detail_rlc',
      explanation: 'Vollständiger Zugriff auf alle Akten',
      group: 'Administrator*innen / Vorstand',
    },
    {
      name: 'view_records_rlc',
      explanation: 'Zugriff auf Grundinformationen der Akten; Sichtbarkeit von Reiter „Records“',
      group: 'Administrator*innen / Vorstand / Berater*innen',
    },
    {
      name: 'write_all_collab_documents_rlc',
      explanation: 'Genereller Schreibzugriff auf Collab Dokumente',
      group: 'Alle Nutzer*innen',
    },
    {
      name: 'write_all_folders_rlc',
      explanation: 'Genereller Schreibzugriff auf Ordner im Dateimanagement',
      group: 'Administrator*innen / Vorstand',
    },
  ];
}
