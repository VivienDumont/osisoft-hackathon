/**
 * @license
 * Copyright © 2017-2018 OSIsoft, LLC. All rights reserved.
 * Use of this source code is governed by the terms in the accompanying LICENSE file.
 */
import { Component, Input, OnChanges, OnInit, OnDestroy, Inject, EventEmitter, Output } from '@angular/core';
import { PiWebApiService } from '@osisoft/piwebapi';
import { DOCUMENT } from '@angular/platform-browser';
import { PIWEBAPI_TOKEN } from '../framework';
import { Location } from '@angular/common';


@Component({
  selector: 'reason-tree',
  templateUrl: 'reason-tree.component.html',
  styleUrls: ['reason-tree.component.css']
})
export class ReasonTreeComponent implements OnChanges, OnInit, OnDestroy{
    @Input() attribute: any;
    @Input() urlPiWebApi: string;
    @Output() askToClose: EventEmitter<any> = new EventEmitter<any>();

    tree: any = {};

    constructor(@Inject(PIWEBAPI_TOKEN) private piWebApiService: PiWebApiService) { }

    GetTreeFromAttribute(){
        const body_batch={
            "0":{
                "Method": "GET",
                "Resource": `${this.urlPiWebApi}/attributes/${this.attribute.WebId}`
            },
            "1":{
                "Method":"GET",
                "Resource": "$.0.Content.Links.EnumerationValues",
                "ParentIds": [
                    "0"
                ]
            }
        };

        this.piWebApiService.batch.execute$(body_batch)
        .subscribe(
            res => {
               const attr = res.body[0].Content;
               this.tree = {
                   Text: attr.Name.toString(),
                   WebId: attr.WebId.toString(),
                   Children: []
               };

               const lst_reason = res.body[1].Content.Items;
               const lst_none_parent = lst_reason.filter(x => x.Parent.toString() === '');
               lst_none_parent.forEach(element => {
                   const to_add = {
                       Text: element.Name.toString(),
                       Name: element.Name.toString(),
                       Value: element.Value,
                       Children: null,
                       Collapse: false
                   };
                   this.tree.Children.push(to_add);
               });
               
               setTimeout(()=>{
                (document.querySelectorAll('a.nav-link.dark')[9] as HTMLElement).click();
                (document.querySelectorAll('a.nav-link.dark')[9] as HTMLElement).click();
              }, 1000);

               const lst_with_parent = lst_reason.filter(x => x.Parent.toString() !== '');
               lst_with_parent.forEach(element => {
                   this.FindParent(this.tree.Children, element);
               });


            },
            e => {
                console.error(e);
            }
        );
    }

    FindParent(arr, reasonToAdd){
        if(arr && arr.length){
            const found = arr.find(x => x.Name === reasonToAdd.Parent.toString());
            if(found){
                const to_add = {
                    Text: reasonToAdd.Name.toString().replace(reasonToAdd.Parent.toString() + '|', ''),
                    Name: reasonToAdd.Name.toString(),
                    Value: reasonToAdd.Value,
                    Children: null,
                    Collapse: false
                };
                if(!found.Children){
                   found.Children = [];
                }
                found.Children.push(to_add);
            } else {
                arr.forEach(element => {
                    this.FindParent(element.Children, reasonToAdd);
                });
            }
        }
    }

    ngOnInit(){
        this.GetTreeFromAttribute();
    }

    ngOnChanges(changes){

    }

    ngOnDestroy(){

    }

    Action(item){
        ////console.log(item);

        const payload = {
            "Value": item.Value
          };
      
          const body_batch = {
            "0":{
              "Method": "PUT",
              "Resource": `https://pisrv01.pischool.int/piwebapi/attributes/${this.attribute.WebId}/value`,
              "Content": JSON.stringify(payload),
              "Headers": {
                "Cache-Control": "no-cache"
              }
            }
          };
          ////console.log(body_batch);
          this.piWebApiService.batch.execute$(body_batch)
          .subscribe(
            r => {
              //console.log(r.body[0]);
              if(200 <= r.body[0].Status && r.body[0].Status < 400){
                //console.log('Save Sucess');
                this.Close();
              } else {
                //console.log(r.body[0].Content.Errors);
              }
              
            },
            e => {
              console.error(e);
            }
          );
    }

    Close(){
        this.askToClose.emit(null);
    }
}