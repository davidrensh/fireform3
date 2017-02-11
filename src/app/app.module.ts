import * as firebase from 'firebase';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { COMPILER_PROVIDERS } from '@angular/compiler';
import { AngularFireModule } from 'angularfire2';

import { TempeditorComponent } from './tempeditor/tempeditor.component';

import { CKEditorModule } from 'ng2-ckeditor';
import { LoaderComponent } from './loader/loader.component';
import { ListComponent } from './list/list.component';
import { ShowComponent } from './show/show.component';
import { ApiComponent } from './api/api.component';
import { routing, appRoutingProviders } from './myrouting/myrouting.component';
import { SignaturePadModule } from 'angular2-signaturepad';
// import { RoleService } from './role.service';
export const firebaseConfig = {
  apiKey: "AIzaSyDUKlFAFOci3eIKn84YGr4Z1A4fexfyfNg",
  authDomain: "formaas.firebaseapp.com",
  databaseURL: "https://formaas.firebaseio.com",//dren1117@gmail.com
  storageBucket: "gs://firebase-formaas.appspot.com"
};

@NgModule({
  declarations: [
   AppComponent,TempeditorComponent, LoaderComponent, ListComponent, ShowComponent, ApiComponent
  ],
  imports: [SignaturePadModule ,routing,CKEditorModule,
    BrowserModule,
    CommonModule,
    FormsModule, AngularFireModule.initializeApp(firebaseConfig)
  ],
  providers: [COMPILER_PROVIDERS],
  entryComponents: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {

}
