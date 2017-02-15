import { Component, ViewChild, ViewChildren, ElementRef, ViewContainerRef, ComponentFactory, NgModule, OnInit, Input, Injectable } from '@angular/core';
import { RuntimeCompiler } from '@angular/compiler';

import { PartsModule } from '../parts/parts.module';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';
import { SignaturePad } from '../signature-pad'; //'angular2-signaturepad/signature-pad';
//import { SignaturePadModule } from 'angular2-signaturepad';
import { BrowserModule } from '@angular/platform-browser'
export interface IHaveDynamicData {
    exdata: any;
    data: any;
    datanewrow: any;
    signed: boolean;
    //listobj: any;
    InitialList(dstable: any): void;
    // UpdateNew(ds: string, rep: string, fieldList: string, v1: any, v2: any, v3: any, v4: any, v5: any, v6: any, v7: any, v8: any, v9: any, v10: any
    //     , v11: any, v12: any, v13: any, v14: any, v15: any, v16: any, v17: any, v18: any, v19: any, v20: any
    //     , v21: any, v22: any, v23: any, v24: any, v25: any, v26: any, v27: any, v28: any, v29: any, v30: any
    //     , v31: any, v32: any, v33: any, v34: any, v35: any, v36: any, v37: any, v38: any, v39: any, v40: any): void;
}

@Injectable()
export class DynamicTypeBuilder {

    // wee need Dynamic component builder
    constructor(
        protected compiler: RuntimeCompiler
    ) { }

    // this object is singleton - so we can use this as a cache
    private _cacheOfFactories: { [templateKey: string]: ComponentFactory<IHaveDynamicData> } = {};

    public createComponentFactory(template: string, mydata: any, attrdata: any)
        : Promise<ComponentFactory<IHaveDynamicData>> {

        let factory = this._cacheOfFactories[template];

        if (factory) {
            console.log("Module and Type are returned from cache")

            return new Promise((resolve) => {
                resolve(factory);
            });
        }

        // unknown template ... let's create a Type for it
        let type = this.createNewComponent(template, mydata, attrdata);
        let module = this.createComponentModule(type);

        return new Promise((resolve) => {
            this.compiler
                .compileModuleAndAllComponentsAsync(module)
                .then((moduleWithFactories) => {
                    //factory = _.find(moduleWithFactories.componentFactories, { componentType: type });
                    factory = moduleWithFactories.componentFactories.find(x => x.componentType === type);
                    this._cacheOfFactories[template] = factory;

                    resolve(factory);
                });
        });
    }

    protected createNewComponent(tmpl: string, dtable: any, attrdata: any) {
        @Component({
            selector: 'dynamic-component',
            template: tmpl,
            styles: [`.padClass {
    position: relative;
    font-size: 10px;
    width: 300px;
    height: 80px;
    border: 1px solid #e8e8e8;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.27), 0 0 40px rgba(0, 0, 0, 0.08) inset;
    border-radius: 4px;
}

div.printborder {
    border: 1px #000 solid;
}
`]
        })
        class CustomDynamicComponent implements IHaveDynamicData, OnInit {
            @ViewChildren(SignaturePad) spa: SignaturePad[];
            // sp1: SignaturePad;
            // sp2: SignaturePad;
            // sp = {};
            //@ViewChild('SignaturePad', { read: ViewContainerRef })
            //<div id="sigpad" class="padClass"><signature-pad [options]="signaturePadOptions" (onBeginEvent)="drawStart()" (onEndEvent)="drawComplete()"></signature-pad></div>
            //public signaturePad: SignaturePad;
            @Input() exdata: any;
            @Input() data: any;
            @Input() datanewrow: any;

            //@Input() listobj: any;
            public listobj = {};
            public rowediting = {};
            public rowdata = {};
            public isDsLoaded = false;
            public signed: boolean = false;
            public typename: string;
            public persontypename: string;
            public needpassword: boolean;
            public needsignature: boolean;
            public password: string;
            enteredPassword: string;
            enteredEmail: string;
            enteredPhone: string;

            statictypename() {
                return this.typename;
            }
            staticpersontypename() {
                //console.log("this.persontypename:" + this.persontypename);
                return this.persontypename;
            }
            staticneedpassword() {
                return this.needpassword;
            }
            staticneedsignature() {
                return this.needsignature;
            }
            staticpassword() {
                return this.password;
            }
            validPassword(): boolean {
                let b = this.validPassword2();
                //console.log("validPassword:" + b);
                return b;
            }
            validPassword2(): boolean {
                if (!this.staticneedpassword()) return true;
                if (this.enteredPassword === undefined) return false;
                //console.log("this.password === this.enteredPassword:" + this.password + " ===" + this.enteredPassword);
                return this.password === this.enteredPassword;
            }
            print() {
                let printContents, popupWin;
                printContents = document.getElementById('print-section').innerHTML;
                popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
                popupWin.document.open();
                popupWin.document.write(`
      <html>
        <head>
          <title>Print tab</title>
          <style type="text/css">
            div.printborder {
                border: 1px #000 solid;
            }
          </style>
        </head>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
                );
                popupWin.document.close();

            }
            constructor(public af: AngularFire, public elementRef: ElementRef) {
                //this.listobj['f03.t1'] = this.af.database.list("/forms/f03/data/block/t1");
                //this.InitialList(dtable);
            }
            ngOnInit() {
                //this.elementRef.
                //this.sp2 = new SignaturePad(document.getElementById('ss'));
                //this.listobj['f03.t1'] = this.af.database.list("/forms/f03/data/block/t1");
                this.InitialList(dtable);
                this.signed = false;
                this.typename = attrdata["typename"];
                this.persontypename = attrdata["persontypename"];
                this.password = attrdata["password"];
                this.needpassword = attrdata["needpassword"];
                this.needsignature = attrdata["needsignature"];
                console.log("data=" + JSON.stringify(this.data));
                //console.log("Data needpassword XXXXXX:" + JSON.stringify(attrdata) + attrdata["needpassword"]);
                //this.signaturePad = new SignaturePad(this.elementRef);
            }
            ngAfterViewInit() {
                // this.signaturePad is now available
                // this.signaturePad.set('minWidth', 0.1); // set szimek/signature_pad options at runtime
                // this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
            }

            public InitialList(dstable: any) {
                for (var item in dstable) {
                    let n: string = item;

                    let pos = n.indexOf('.', 0);
                    let ds = n.substring(1, pos);
                    let rep = n.substring(pos + 1, n.length - 1);
                    let s = "/forms/" + ds + "/data/block/" + rep;
                    let sname = ds + "." + rep;

                    this.listobj[sname] = this.af.database.list(s);
                }
                //console.log("list=" + JSON.stringify(this.listobj));
            }
            private signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
                'minWidth': 0.1,
                'canvasWidth': 300,
                'canvasHeight': 80
            };
            drawComplete(name) {
                // console.log("this.signaturePad" + this.signaturePad);
                //  console.log("SignaturePad" + SignaturePad );
                // debugger;
                // // will be notified of szimek/signature_pad's onEnd event
                console.log("name=" + name);
                // if (this.spa[0] !== undefined) {
                //     console.log(this.spa[0].toDataURL());
                //     this.signed = true;
                // }
                // if (this.spa[1] !== undefined) {
                //     console.log(this.spa[1].toDataURL());
                //     this.signed = true;
                // }
                //console.log("this.element" +  document.getElementById('sig1').innerHTML);// this.elementRef.nativeElement.getElementById("sig1"));
                this.spa.forEach(function (element) {
                   
                    let id= element.elementRef.nativeElement.id;
                    if (element !== undefined && id === name) {

                        console.log(element.toDataURL());
                        //console.log(element.elementRef);
                        //element.
                        //this.signed = true;
                    }
                });
                // console.log("this.sp anem =" + name);
                // console.log("this.sp =" + JSON.stringify(this.sp[name]));
                // if (this.sp[name] !== undefined) {
                //     console.log(this.sp[name].toDataURL());
                //     this.signed = true;
                // }
            }

            drawStart() {
                // will be notified of szimek/signature_pad's onBegin event
                console.log('begin drawing');
                // if (this.spa[0] !== undefined) {
                //     console.log(this.spa[0].toDataURL());
                //     this.signed = true;
                // }
                // if (this.spa[1] !== undefined) {
                //     console.log(this.spa[1].toDataURL());
                //     this.signed = true;
                // }
            }
            getlist(ds: string, rep: string): any {
                return this.listobj[ds + '.' + rep];
            }

            SetEdit(ds: string, rep: string, fieldlist: string, obj: any): void {
                console.log("SetEdit:" + obj.$key);
                this.rowediting[obj.$key] = true;
                var nl = fieldlist.split(',');
                for (var i = 0; i < nl.length; i++) {
                    let n = nl[i];
                    this.rowdata[obj.$key + n] = obj[n];// eval('dataobj.' + n);
                }
            }
            DeleteRow(ds: string, rep: string, rkey: string): void {
                console.log("Delete row:" + rkey);
                this.af.database.object("/forms/" + ds + "/data/block/" + rep + "/" + rkey).remove();
            }
            CancelEdit(rkey: string): void {
                console.log("Cancel:" + rkey);
                this.rowediting[rkey] = false;;
            }
            Update(ds: string, rep: string, fieldlist: string, rkey: string): void {
                console.log("Update:" + ds + rep + fieldlist + rkey);
                this.rowediting[rkey] = false;

                let pl = "";
                var nl = fieldlist.split(',');
                const item = this.af.database.object("/forms/" + ds + "/data/block/" + rep + "/" + rkey);
                for (var i = 0; i < nl.length; i++) {
                    let n = nl[i];
                    pl = pl + n + ': ' + this.rowdata[rkey + n] + ',';
                }
                pl = pl.substring(0, pl.length - 1);
                let ss = 'item.update({' + pl + '});';
                eval(ss);
            }
            UpdateNew(ds: string, rep: string, fieldList: string
                , v1: any, v2: any, v3: any, v4: any, v5: any, v6: any, v7: any, v8: any, v9: any, v10: any
                , v11: any, v12: any, v13: any, v14: any, v15: any, v16: any, v17: any, v18: any, v19: any, v20: any
                , v21: any, v22: any, v23: any, v24: any, v25: any, v26: any, v27: any, v28: any, v29: any, v30: any
                , v31: any, v32: any, v33: any, v34: any, v35: any, v36: any, v37: any, v38: any, v39: any, v40: any) {

                let pl = "";
                if (ds !== undefined) {
                    var nl = fieldList.split(',');
                    //let d = (new Date()).toISOString().substr(0, 10);
                    const item = this.af.database.list("/forms/" + ds + "/data/block/" + rep);
                    //let dataname = "'" + ds + "." + rep + "." + nl + "'";
                    //console.log("dataname:" + dataname );
                    for (var i = 0; i < nl.length; i++) {
                        let n = nl[i];
                        let k = i + 1;
                        // let dataname = "'" + ds + "." + rep + "." + n + "'";
                        pl = pl + n + ': v' + k + ',';
                    }
                    eval('item.push({' + pl + '});');
                }
            }
        };
        // a component for this particular template
        return CustomDynamicComponent;
    }
    protected createComponentModule(componentType: any) {
        @NgModule({
            imports: [
                PartsModule, // there are 'text-editor', 'string-editor'...
            ],
            declarations: [
               SignaturePad, componentType
            ],
        })
        class RuntimeComponentModule {
        }
        // a module for just this Type
        return RuntimeComponentModule;
    }
}