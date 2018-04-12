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
  selector: 'eventframe-zoom',
  templateUrl: 'eventframe-zoom.component.html',
  styleUrls: ['eventframe-zoom.component.css']
})
export class EventFrameZommComponent implements OnChanges, OnInit, OnDestroy{
    @Input() eventframe: any;
    @Input() elementOfEF: any;
    @Input() urlPiWebApi: string;
    @Output() askToClose: EventEmitter<any> = new EventEmitter<any>();

    attributeForTreeReason: any = null;
    isTreeReasonOpen: boolean = false;

    constructor(@Inject(PIWEBAPI_TOKEN) private piWebApiService: PiWebApiService){}

    ngOnInit(){
      this.GetAttributeOfEF();
    }

    GetAttributeOfEF(){
      const params = {
        showExcluded: true,
        showHidden: true
      };

      this.piWebApiService.eventFrame.getAttributes$(this.eventframe.WebId, params)
      .subscribe(
        r => {
          const lstAttr = r.Items;
          this.eventframe.lstCompleteAttribute = [];
          lstAttr.forEach((attr, index) => {
            const to_add = {
              WebId: attr.WebId.toString(),
              Name: attr.Name.toString(),
              Value: null,
              NameValue: '',
              UnitsAbbreviation: '',
              IsManualDataEntry: attr.IsManualDataEntry as boolean,
              HasToBeHide: ((attr.IsHidden as boolean) || (attr.IsExcluded as boolean)),
              HasReason: (attr.TraitName.toString().indexOf('Reason')+1)? true:false,
              IsEnum: (attr.Type.toString() === 'EnumerationValue')
            };
            
            
            if(attr.HasChildren as boolean) {
              this.GetAttributeOfAttribute(attr, index);
            }
            if(to_add.IsEnum && to_add.IsManualDataEntry) {
              this.getEnumerationOfAttribute(attr, index);
            }
            
            this.eventframe.lstCompleteAttribute.push(to_add);

            this.getValueOfAttribute(attr, index);
          });

          setTimeout(()=>{
            (document.querySelectorAll('a.nav-link.dark')[9] as HTMLElement).click();
            (document.querySelectorAll('a.nav-link.dark')[9] as HTMLElement).click();
          }, 1000);
        },
        e => {
          console.error(e);
        }
      );
    }

    getValueOfAttribute(attribute, index){
      this.piWebApiService.stream.getValue$(attribute.WebId)
      .subscribe(
        r => {
          let value = r.Value;
          let name = '';
          if(value && value.Name){
            name = value.Name;
            value = value.Value;
          }
          this.eventframe.lstCompleteAttribute[index].UnitsAbbreviation = r.UnitsAbbreviation;
          this.eventframe.lstCompleteAttribute[index].Value = value;
          this.eventframe.lstCompleteAttribute[index].NameValue = name;
        },
        e => {
          console.error(e);
        }
      );
    }

    GetAttributeOfAttribute(attribute, indexAttr){
      this.piWebApiService.attribute.getAttributes$(attribute.WebId)
      .subscribe(
        r => {
          const hi = r.Items.find(x => x.Name.toString() === 'Hi');
          const lo = r.Items.find(x => x.Name.toString() === 'Lo');
  
          if(hi && lo){
            this.eventframe.lstCompleteAttribute[indexAttr].Limits = {};
            this.getValueOfAttributeOfAttribute(hi, indexAttr);
            this.getValueOfAttributeOfAttribute(lo, indexAttr);
          }
  
        },
        e => {
          console.error(e);
        }
      );
    }
  
    getValueOfAttributeOfAttribute(attribute, indexAttr){
      this.piWebApiService.stream.getValue$(attribute.WebId)
      .subscribe(
        r=>{
          if(attribute.Name.toString() === 'Hi'){
            this.eventframe.lstCompleteAttribute[indexAttr].Limits.High = r.Value;
          }
          if(attribute.Name.toString() === 'Lo'){
            this.eventframe.lstCompleteAttribute[indexAttr].Limits.Low = r.Value;
          }
        },
        e=>{
          console.error(e);
        }
      );
    }

    getEnumerationOfAttribute(attribute, indexAttr){
      const body_batch = {
        '0':{
          'Method': 'GET',
          'Resource': attribute.Links.EnumerationValues
        }
      };
  
      this.piWebApiService.batch.execute$(body_batch)
      .subscribe(
        r => {
          const items = r.body[0].Content.Items;
          let enums = [];
  
          items.forEach(item => {
            const toAdd = {
              Name: item.Name,
              Value: item.Value
            }
            enums.push(toAdd);
          });
          this.eventframe.lstCompleteAttribute[indexAttr].Enums = enums;
        },
        e => {
          console.error(e);
        }
      );
    }

    

    ngOnDestroy(){

    }

    ngOnChanges(changes){
        
    }

    SaveAttributeValue(attr){
      const payload = {
        "Value": attr.Value
      };
  
      const body_batch = {
        "0":{
          "Method": "PUT",
          "Resource": `${this.urlPiWebApi}/attributes/${attr.WebId}/value`,
          "Content": JSON.stringify(payload),
          "Headers": {
            "Cache-Control": "no-cache"
          }
        }
      };
      console.log(body_batch);
      this.piWebApiService.batch.execute$(body_batch)
      .subscribe(
        r => {
          console.log(r.body[0]);
          if(200 <= r.body[0].Status && r.body[0].Status < 400){
            console.log('Save Sucess');
          } else {
            console.log(r.body[0].Content.Errors);
          }
          
        },
        e => {
          console.error(e);
        }
      );
    }

    CloseZoom(){
      this.askToClose.emit(null);
    }


    OpenReasonTree(attr){
      this.isTreeReasonOpen = true;
      this.attributeForTreeReason = attr;
    }

    CloseReasonTree(event){
      this.attributeForTreeReason = null;
      this.isTreeReasonOpen = false;
      this.GetAttributeOfEF();
    }

    HasLimits(val){
      return (val && val.Limits)?true:false;
    }
  
    ColorTextIfLimits(val){
      const inside = 'darkgreen';
      const outside = 'red';
      if(val && val.Limits){
        const low = val.Limits.Low as number;
        const value = val.Value as number;
        const high = val.Limits.High as Number;
        return (low <= value && value <= high)? inside : outside;
      }
      return 'black';
    }

    getColorByBgColor(bgColor) {
      if (!bgColor) { return ''; }
      return (parseInt(bgColor.replace('#', ''), 16) > 0xffffff / 2) ? '#000' : '#fff';
    }
}