import { Component, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { TextDocument } from '../../models/text-document.model';
import Quill from 'quill';
import { QuillEditorComponent } from 'ngx-quill';
import { CollabSandboxService } from '../../services/collab-sandbox.service';
import { EditingRoom } from '../../models/editing-room.model';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { QuillBinding } from 'y-quill';
import { RestrictedUser } from '../../../core/models/user.model';
import { Router } from '@angular/router';
import { GetCollabViewFrontUrl } from '../../../statics/frontend_links.statics';
const hash = require('object-hash');

@Component({
  selector: 'app-custom-quill-container',
  templateUrl: './custom-quill-container.component.html',
  styleUrls: ['./custom-quill-container.component.scss'],
})
export class CustomQuillContainerComponent implements OnChanges, OnDestroy {
  @Input()
  text_document: TextDocument;

  @Input()
  editingMode: boolean;

  @Input()
  did_create: boolean;

  @Input()
  editing_room: EditingRoom;

  quillRef: Quill;
  provider: WebrtcProvider;
  binding: QuillBinding;
  user: RestrictedUser;

  loading = false;
  connectedToPeers = false;

  savedHash = '';

  @ViewChild(QuillEditorComponent, { static: true }) editor: QuillEditorComponent;
  modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'], // toggled buttons
      ['blockquote'],

      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }], // outdent/indent

      // [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
      [{ header: [1, 2, 3, 4, 5, 6, false] }],

      [{ color: [] }, { background: [] }], // dropdown with defaults from theme
      [{ align: [] }],

      ['clean'], // remove formatting button

      ['link'], // link and image, video
    ],
    cursors: true,
  };

  constructor(private collabSB: CollabSandboxService, private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('text_document' in changes) {
      this.text_document = changes['text_document']['currentValue'];
      this.initQuill();
    }
    if ('editing_room' in changes) {
      this.initQuill();
    }
  }

  ngOnDestroy(): void {
    if (this.provider) {
      this.provider.destroy();
    }
    this.closeConnection();
  }

  closeConnection(): void {
    if (this.editingMode && this.provider) {
      this.provider.destroy();
      // if alone on document, delete editing room in backend
      if (this.provider.awareness.states.size === 1) {
        this.collabSB.closeEditingRoom(this.text_document.id);
      }
    }
  }

  @HostListener('window:beforeunload')
  beforeUnload() {
    if (this.provider) {
      this.provider.destroy();
    }
    this.closeConnection();
  }

  created(event: Quill): void {
    this.quillRef = event;
    this.initQuill();
  }

  initQuill(): void {
    this.loading = true;

    const last_published_content = this.text_document.content;

    if (!this.editingMode && this.quillRef && this.text_document && last_published_content !== undefined) {
      if (last_published_content === '') {
        // @ts-ignore
        this.quillRef.setContents([]);
      } else {
        setTimeout(() => {
          const json = JSON.parse(last_published_content);
          this.quillRef.setContents(json);
        }, 0);
      }
      setTimeout(() => {
        this.loading = false;
      }, 0);
    }
    if (!this.editingMode) {
      if (this.quillRef) this.quillRef.enable(false);
      return;
    }

    const last_content: string = this.text_document.versions[0].content;
    if (this.editing_room && this.editingMode) {
      if (this.provider) {
        this.provider.destroy();
      }

      const ydoc = new Y.Doc();
      // @ts-ignore
      this.provider = new WebrtcProvider(this.editing_room.room_id, ydoc, {
        password: this.editing_room.password,
        signaling: ['wss://y-webrtc-signaling-eu.herokuapp.com/'],
      });
      this.provider.connect();
      if (this.user) {
        // set user if already possible, if not, set in subscription in constructor
        this.setUser();
      }

      this.binding = new QuillBinding(ydoc.getText('quill'), this.quillRef, this.provider.awareness);
      this.loading = true;

      const timeout = Math.max(last_content.length * 0.5, 600);
      setTimeout(() => {
        if (!this.connectedToPeers && this.provider.awareness.getStates().size === 1) {
          this.connectedToPeers = true;
          this.setContents();
        }
        this.loading = false;
      }, timeout);

      this.provider.awareness.once('update', () => {
        const states = this.provider.awareness.states.size;
        if (!this.connectedToPeers) {
          this.connectedToPeers = true;
          if (states > 1) {
            // show sth?
          } else {
            this.setContents();
          }
          this.loading = false;
        }
      });
    }
  }

  setUser(): void {
    this.provider.awareness.setLocalStateField('user', {
      name: this.user.name,
      id: this.user.id,
    });
  }

  hasUnsaved(): boolean {
    if (this.editingMode) {
      return this.getHash() !== this.savedHash;
    }
    return false;
  }

  setContents(): void {
    const last_content: string = this.text_document.versions[0].content;
    if (last_content !== '') {
      this.quillRef.setContents(JSON.parse(last_content));
      this.savedHash = this.getHash();
    }
  }

  getHash(): string {
    return hash(JSON.stringify(this.quillRef.getContents()));
  }

  onSaveClick(): void {
    const stringified = JSON.stringify(this.quillRef.getContents());
    this.collabSB.saveTextDocument(this.text_document.id, stringified);
    this.savedHash = hash(stringified);
  }

  onSaveDraftClick(): void {
    const stringified = JSON.stringify(this.quillRef.getContents());
    this.collabSB.saveTextDocument(this.text_document.id, stringified, true);
    this.savedHash = hash(stringified);
  }

  onCloseClick(): void {
    this.router.navigateByUrl(GetCollabViewFrontUrl(this.text_document.id));
  }
}
