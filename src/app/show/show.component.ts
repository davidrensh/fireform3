//import { Component } from '@angular/core';
import { Component, ComponentRef, ViewChild, ViewContainerRef}   from '@angular/core';
import { AfterViewInit, OnInit, OnDestroy}          from '@angular/core';
import { OnChanges, SimpleChange, ComponentFactory} from '@angular/core';
//import {RuntimeCompiler} from '@angular/compiler';
import { COMPILER_PROVIDERS } from '@angular/compiler';

import { IHaveDynamicData, DynamicTypeBuilder } from '../dynamic/type.builder';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

import { ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-show',
  template: `
<div>
  <button class="btn btn-primary-outline btn-sm" (click)="refreshContent()">Refresh</button>
  <button class="btn btn-primary-outline btn-sm" (click)="saveData()">Save Data</button>
  <div #dynamicContentPlaceHolder></div>  <hr />
  data: <pre>{{data | json}}</pre>
</div>
`,
  providers: [DynamicTypeBuilder, COMPILER_PROVIDERS]
})
export class ShowComponent implements AfterViewInit, OnChanges, OnDestroy, OnInit {
  // reference for a <div> with #dynamicContentPlaceHolder
  @ViewChild('dynamicContentPlaceHolder', { read: ViewContainerRef })
  protected dynamicComponentTarget: ViewContainerRef;
  //data: any ={};
  // this will be reference to dynamic content - to be able to destroy it
  protected componentRef: ComponentRef<IHaveDynamicData>;
  private sub: any;
  // until ngAfterViewInit, we cannot start (firstly) to process dynamic stuff
  protected wasViewInitialized = false;

  // example entity ... to be recieved from other app parts
  // this is kind of candiate for @Input
  protected data = {};// { namea: "ABC123",nameb: "A description of this Entity" };
  static namelist: string[] = [];
  static html: string;
  static formname: string = "f02";
  // wee need Dynamic component builder
  constructor(protected typeBuilder: DynamicTypeBuilder, public af: AngularFire, private route: ActivatedRoute) {
    //let formname: string = "f01";

    // if (ShowComponent.formname == "f01") console.log("Correct!!");
    // this.af.database.object("/forms/" + ShowComponent.formname).subscribe(res => {
    //   if (res && res.contenthtml) {
    //     let convertedHtml: string = this.ConvertToNg2Template(res.contenthtml);
    //     //console.log("html=" + convertedHtml);
    //     ShowComponent.html = convertedHtml;
    //   }
    // }
    // );

  }
  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      console.log("pppp:" + params['id']);
      ShowComponent.formname = params['id']; // (+) converts string 'id' to a number
      this.af.database.object("/forms/" + ShowComponent.formname).subscribe(res => {
        if (res && res.contenthtml) {
          let convertedHtml: string = this.ConvertToNg2Template(res.contenthtml);
          //console.log("html=" + convertedHtml);
          ShowComponent.html = convertedHtml;
        }
      }
      );
      // In a real app: dispatch action to load the details here.
    });
    // setTimeout(() => {
    //   if (ShowComponent.formname == "f01") console.log("Correct!!");
    //   this.af.database.object("/forms/" + ShowComponent.formname).subscribe(res => {
    //     if (res && res.contenthtml) {
    //       let convertedHtml: string = this.ConvertToNg2Template(res.contenthtml);
    //       //console.log("html=" + convertedHtml);
    //       ShowComponent.html = convertedHtml;
    //     }
    //   }
    //   );
    // }, 1000);
  }

  saveData() {
    //console.log("data=" + this.data['aa'] + JSON.stringify(this.data));
    let formname: string = "f01";
    if (ShowComponent.namelist !== undefined) {
      console.log("namelist=" + ShowComponent.namelist + ShowComponent.namelist.length);//this.data['aa'] + JSON.stringify(this.data));
      for (var i = 0; i < ShowComponent.namelist.length; i++) {
        let n = ShowComponent.namelist[i];
        console.log("name:" + n + "data=" + this.data[n]);
        this.af.database.object("/forms/" + formname + "/data/" + n).update({
          varname: n,
          value: this.data[n],
          updateddate: (new Date()).toISOString().substr(0, 10)
        });
      }
    }
  }
  ConvertToNg2Template(src: string): string {
    return this.ConvertInputTextBox(src);
  }
  ConvertInputTextBox(src: string): string {
    //var src = '<input maxlength="11" name="aa" size="11" type="text" value="aa" />';
    var p2 = src.replace(/(input.+)(name=")(.+?)(".+)(type="text")/, function (match, prefix, handler, name, suffix, suffix2) {
      if (ShowComponent.namelist !== undefined) { ShowComponent.namelist.push(name); }
      return prefix + '[(ngModel)]="data[\'' + name + '\']' + suffix;
    });
    return p2;
  }
  protected refreshContent() {

    if (this.componentRef) {
      this.componentRef.destroy();
    }

    if (ShowComponent.html == undefined) return;
    // here we get a TEMPLATE with dynamic content === TODO
    //var template = this.templateBuilder.prepareTemplate(this.entity, useTextarea);

    //var template = `<p><input maxlength="11" [(ngModel)]="data['aa']" size="11" /></p>`;// this.templateBuilder.prepareTemplate(this.entity, useTextarea);
    var template = ShowComponent.html;
    //console.log("template=" + template);
    // this.entity.push('namea','100');
    // this.entity.push('nameb','200');            
    // here we get Factory (just compiled or from cache)
    this.typeBuilder
      .createComponentFactory(template)
      .then((factory: ComponentFactory<IHaveDynamicData>) => {
        // Target will instantiate and inject component (we'll keep reference to it)
        this.componentRef = this
          .dynamicComponentTarget
          .createComponent(factory);

        // let's inject @Inputs to component instance
        let component = this.componentRef.instance;

        component.data = this.data;
        //...
      });
  }

  /** IN CASE WE WANT TO RE/Gerante - we need cean up */

  // this is the best moment where to start to process dynamic stuff
  public ngAfterViewInit(): void {
    this.wasViewInitialized = true;
    setTimeout(() => {
      this.refreshContent();
    }, 1000);
  }
  // wasViewInitialized is an IMPORTANT switch 
  // when this component would have its own changing @Input()
  // - then we have to wait till view is intialized - first OnChange is too soon
  public ngOnChanges(changes: { [key: string]: SimpleChange }): void {
    if (this.wasViewInitialized) {
      return;
    }
    this.refreshContent();
  }
  public ngOnDestroy() {
    this.sub.unsubscribe();
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }


}