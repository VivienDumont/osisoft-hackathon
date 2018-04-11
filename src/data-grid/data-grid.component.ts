/**
 * @license
 * Copyright © 2017-2018 OSIsoft, LLC. All rights reserved.
 * Use of this source code is governed by the terms in the accompanying LICENSE file.
 */
import { Component, Input, OnChanges, OnInit, OnDestroy, Inject } from '@angular/core';
import { PiWebApiService } from '@osisoft/piwebapi';
import { DOCUMENT } from '@angular/platform-browser';
import { PIWEBAPI_TOKEN } from '../framework';
import { Location } from '@angular/common';


@Component({
  selector: 'data-grid',
  templateUrl: 'data-grid.component.html',
  styleUrls: ['data-grid.component.css']
})
export class DataGridComponent implements OnChanges, OnInit, OnDestroy {
  @Input() fgColor: string;
  @Input() bkColor: string;
  @Input() data: any;
  @Input() pathPrefix: string;
  @Input() urlPiWebApi: string;
  
  eventFrames: any = [];
  lst_range:any = [];
  lst_attribute:  any = [];
  lst_attribute_to_display: any;
  element_ef: string = 'Element/EventType';
  starttime: string;
  endtime: string;
  isByTime: boolean = false;
  typeOfSearch: string = 'BackwardFromStartTime';

  diffTime = 8; //in hour

  intervalNum: any;

  isStarActivate: boolean = false; 

  webidElement = '';
  webidEF = '';
  eftype = '';

  isTreeReasonOpen:  boolean = false;
  attributeForTreeReason: any = null;

  constructor(@Inject(PIWEBAPI_TOKEN) private piWebApiService: PiWebApiService, private location: Location, @Inject(DOCUMENT) private document: any, ){
    
  }

  ngOnChanges(changes) {
    console.log(changes);
    if (changes) {

    }
  }

  ngOnInit() {
    const url = decodeURIComponent(this.location.path());
    const lst_param = url.split('?')[1].split('&');

    lst_param.forEach(param => {
      const key = param.split('=')[0];
      const value = param.split('=')[1];
      if(key === 'webidEF'){
        this.webidEF = value;
      }

      if(key === 'navigationState'){
        this.isByTime = value === 'time';
      }

      if(key === 'startTime'){
        this.starttime = value;
      }
      if(key === 'endTime'){
        this.endtime = value;
      }

      if(key === 'starActivate'){
        this.isStarActivate = (value === 'true');
      }
    });

    if(this.isStarActivate){
      this.endtime = '*';
      this.starttime = (this.isByTime)? '*-24h':'*-3d';
    }

    this.GetEventFramesInit();

    // this.intervalNum = setInterval(() => {
    //   this.GetEventFrames();
    // }, 10000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalNum);
  }

  GetEventFrames(){

    let url = '';
    if(this.isByTime){
      url = `${this.urlPiWebApi}/elements/${this.webidElement}/eventframes?starttime=${this.starttime}&endtime=${this.endtime}`;
    } else {
      url = `${this.urlPiWebApi}/elements/${this.webidElement}/eventframes?starttime=${this.starttime}&searchMode=${this.typeOfSearch}`;
    }

    const body = {
      "0":{
        "Method": "GET",
        "Resource": url
      }
    };

    this.piWebApiService.batch.execute$(body)
    .subscribe(
      r => {
        if(r.body[0].Content.Items.length == 0){
          return;
        }
        
        this.eventFrames = r.body[0].Content.Items.filter(x => x.TemplateName === this.eftype || x.TemplateName.indexOf(this.eftype)+1 || this.eftype.indexOf(x.TemplateName)+1);
        
        if(!this.isByTime){
          this.eventFrames = this.eventFrames.slice(0,3);
        }
        
        if(this.typeOfSearch === 'BackwardFromStartTime' && !this.isByTime){
          this.eventFrames = this.eventFrames.reverse();
        }

        this.lst_attribute = [];

        this.lst_range = [];
        this.eventFrames.forEach((ef, index) => {
          const toadd = {
            StartTime: ef.StartTime.replace('T', ' ').replace('Z', '').slice(0, -3),
            EndTime: (ef.EndTime.indexOf('9999')+1)? '-' : ef.EndTime.replace('T', ' ').replace('Z', '').slice(0, -3)
          }
          this.lst_range.push(toadd);
          this.GetAttributes(ef, index);

          setTimeout(()=>{
            (document.querySelectorAll('a.nav-link.dark')[9] as HTMLElement).click();
            (document.querySelectorAll('a.nav-link.dark')[9] as HTMLElement).click();
          }, 1000);
        });
      },
      e => {
        console.error(e);
      }
    );
  }

  GetEventFramesInit() {
    let url = `${this.urlPiWebApi}/elements/{0}/eventframes?starttime=${this.starttime}&endtime=${this.endtime}`    

    const body = {
      "0":{
        "Method": "GET",
        "Resource": this.urlPiWebApi+"/eventframes/"+this.webidEF
      },
      "1":{
        "Method": "GET",
        "Resource": this.urlPiWebApi+"/elements/{0}",
        "Parameters": [
          "$.0.Content.RefElementWebIds[0]"
        ],
        "ParentIds": [
          "0"
        ]
      },
      "2":{
        "Method":"GET",
        "Resource": url,
        "Parameters": [
          "$.1.Content.WebId",
          "$.0.Content.StartTime"
        ],
        "ParentIds": [
          "0",
          "1"
        ]
      }
    };
    this.piWebApiService.batch.execute$(body)
    .subscribe(
      r => {
        this.eftype = r.body[0].Content.TemplateName;
        //this.starttime = r.body[0].Content.EndTime;
        
        this.webidElement = r.body[1].Content.WebId;
        this.element_ef = r.body[1].Content.Name + ' | ' + this.eftype;

        this.eventFrames = r.body[2].Content.Items.filter(x => x.TemplateName.toString() === this.eftype || x.TemplateName.toString().indexOf(this.eftype)+1 || this.eftype.indexOf(x.TemplateName.toString())+1);

        if(!this.isByTime && this.eventFrames.length>3){
          //this.eventFrames = this.eventFrames.slice(Math.max(this.eventFrames.length - 3, 1));
        }
        
        this.lst_range = [];

        this.eventFrames.forEach((ef, index) => {
          const toadd = {
            StartTime: ef.StartTime.replace('T', ' ').replace('Z', '').slice(0, -3),
            EndTime: (ef.EndTime.indexOf('9999') + 1)? '-' : ef.EndTime.replace('T', ' ').replace('Z', '').slice(0, -3)
          };
          this.lst_range.push(toadd);
          this.GetAttributes(ef, index);
        });
      },
      e => {
        console.error(e);
      }
    );
  }

  GetAttributes(eventFrame, index) {
    const params = {
      showExcluded: true,
      showHidden: true
    }

    this.piWebApiService.eventFrame.getAttributes$(eventFrame.WebId, params)
    .subscribe(
      r => {
        const attributes = r.Items;
        attributes.forEach(attr => {
          let found = this.lst_attribute.find(x => x.Name && x.Name.toString()===attr.Name.toString());
          if(!found){
            const to_add = {
              Name: attr.Name.toString(),
              Values: [],
              IsManualDataEntry: attr.IsManualDataEntry as boolean,
              HasToBeHide: ((attr.IsHidden as boolean) || (attr.IsExcluded as boolean)),
              HasReason: (attr.TraitName.toString().indexOf('Reason')+1)? true:false,
              IsEnum: (attr.Type.toString() === 'EnumerationValue')
            };
            this.lst_attribute.push(to_add);
            found = to_add;
          }
          const index_attr = this.lst_attribute.indexOf(found);
          this.GetValueOfAttribute(attr, index, index_attr);

          if(attr.HasChildren as boolean){
            this.GetAttributeOfAttribute(attr, index, index_attr);
          }
          if(found.IsEnum){
            this.getEnumerationOfAttribute(attr, index, index_attr);
          }
          
        });
        this.lst_attribute_to_display = this.lst_attribute.filter(x => !x.HasToBeHide);
      },
      e => {
        console.error(e);
      }
    );
  }

  GetValueOfAttribute(attr, index, index_attr){
    this.piWebApiService.stream.getValue$(attr.WebId)
    .subscribe(
      r => {
        let value = r.Value;
        let name = '';
        
        if(value && value.Name){
          name = value.Name.toString();
          value = value.Value;
        }
        this.lst_attribute[index_attr].Values[index] = {
          Value: value,
          Name: name,
          idEF: index,
          idAttr: index_attr,
          UnitsAbbreviation: r.UnitsAbbreviation,
          WebId: attr.WebId,
          Limits: null
        };
      },
      e => {
        console.error(e);
      }
    );
  }

  GetAttributeOfAttribute(attribute, indexEF, indexAttr){
    this.piWebApiService.attribute.getAttributes$(attribute.WebId)
    .subscribe(
      r => {
        const hi = r.Items.find(x => x.Name.toString() === 'Hi');
        const lo = r.Items.find(x => x.Name.toString() === 'Lo');

        if(hi && lo){
          this.lst_attribute[indexAttr].Values[indexEF].Limits = {};
          this.getValueOfAttributeOfAttribute(hi, indexEF, indexAttr);
          this.getValueOfAttributeOfAttribute(lo, indexEF, indexAttr);
        }

      },
      e => {
        console.error(e);
      }
    );
  }

  getValueOfAttributeOfAttribute(attribute, indexEF, indexAttr){
    this.piWebApiService.stream.getValue$(attribute.WebId)
    .subscribe(
      r=>{
        if(attribute.Name.toString() === 'Hi'){
          this.lst_attribute[indexAttr].Values[indexEF].Limits.High = r.Value;
        }
        if(attribute.Name.toString() === 'Lo'){
          this.lst_attribute[indexAttr].Values[indexEF].Limits.Low = r.Value;
        }
      },
      e=>{
        console.error(e);
      }
    );
  }

  getEnumerationOfAttribute(attribute, indexEF, indexAttr){
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
        this.lst_attribute[indexAttr].Enums = enums;
      },
      e => {
        console.error(e);
      }
    );
  }

  ToggleBetweemByEventByTime(){
    console.log('ToggleBetweemByEventByTime ' + this.isByTime);
  }

  GoBefore(){
    if(this.isByTime){
      this.starttime = this.eventFrames[0].StartTime + '-24h';
      this.endtime = this.eventFrames[0].StartTime;
      
    } else {
      this.starttime = this.eventFrames[0].StartTime;
    }
    //clearInterval(this.intervalNum);
    this.typeOfSearch = 'BackwardFromStartTime';
    this.GetEventFrames();
    this.isStarActivate = false;
    // this.intervalNum = setInterval(() => {
    //   this.GetEventFrames();
    // }, 10000);
  }

  GoAfter(){
    if(this.eventFrames[this.eventFrames.length-1].EndTime !== '-'){

      this.starttime = this.eventFrames[this.eventFrames.length-1].EndTime;
      this.endtime = this.eventFrames[this.eventFrames.length-1].EndTime + '+24h';
      //clearInterval(this.intervalNum);
      this.typeOfSearch = 'ForwardFromStartTime';
      this.GetEventFrames();
      this.isStarActivate = false;
      // this.intervalNum = setInterval(() => {
      //   this.GetEventFrames('ForwardFromStartTime');
      // }, 10000);
    }
  }

  ActivateStar(){
    this.isStarActivate = !this.isStarActivate;

    if(this.isStarActivate){
      if(this.isByTime){
        this.starttime = '*-24h';
        this.endtime = '*';
      } else {
        this.starttime = '*';
      }

      this.GetEventFrames();
    }

    //go to original
  }

  trackByFn(index, item) {
    return index; // or item.id
  }

  SaveAttributeValue(val){
    const payload = {
      "Value": val.Value
    };

    const body_batch = {
      "0":{
        "Method": "PUT",
        "Resource": `${this.urlPiWebApi}/attributes/${val.WebId}/value`,
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

  OpenReasonTree(val){
    this.isTreeReasonOpen = true;
    this.attributeForTreeReason = val;
  }

  CloseReasonTree(event){
    this.GetEventFrames();
    this.attributeForTreeReason = null;
    this.isTreeReasonOpen = false;
  }


  GetColorOfEventFrame(event){
    const indexEF = this.eventFrames.indexOf(event);
    if(indexEF>=0){
      const foundColor = this.lst_attribute.find(x => x.Name.toString() === 'EventFrameColor');
      if(foundColor){
        return foundColor.Values[indexEF].Name.toString().toLowerCase();
      }
    }
    return this.bkColor;
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
    return 'black'
  }
}
