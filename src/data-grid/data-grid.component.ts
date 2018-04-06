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
  selector: 'example',
  templateUrl: 'data-grid.component.html',
  styleUrls: ['data-grid.component.css']
})
export class DataGridComponent implements OnChanges, OnInit, OnDestroy {
  @Input() fgColor: string;
  @Input() bkColor: string;
  @Input() data: any;
  @Input() pathPrefix: string;
  
  eventFrames: any = [];
  lst_range:any = [];
  lst_attribute:  any = [];
  element_ef: string = 'Element/EventType';
  starttime: string;
  endtime: string;
  isByTime: boolean = false;
  diffTime = 8; //in hour

  intervalNum: any;

  isStarActivate: boolean = true; 

  webidElement = '';
  webidEF = '';
  eftype = '';

  constructor(@Inject(PIWEBAPI_TOKEN) private piWebApiService: PiWebApiService, private location: Location ){

  }

  ngOnChanges(changes) {
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
    });
    this.GetEventFramesInit();

    // this.intervalNum = setInterval(() => {
    //   this.GetEventFrames();
    // }, 10000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalNum);
  }

  GetEventFrames(searchMode: string = 'BackwardFromStartTime'){

    let url = '';
    if(this.isByTime){
      url = `https://pisrv01.pischool.int/piwebapi/elements/${this.webidElement}/eventframes?starttime=${this.starttime}&endtime=${this.endtime}`;
    } else {
      url = `https://pisrv01.pischool.int/piwebapi/elements/${this.webidElement}/eventframes?starttime=${this.starttime}&searchMode=${searchMode}`;
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
        
        if(searchMode === 'BackwardFromStartTime'){
          this.eventFrames = this.eventFrames.reverse();
        }

        this.lst_attribute = [];

        this.lst_range = [];
        this.eventFrames.forEach((ef, index) => {
          const toadd = {
            StartTime: ef.StartTime.replace('T', ' ').replace('Z', ''),
            EndTime: (ef.EndTime.indexOf('9999')+1)? '-' : ef.EndTime.replace('T', ' ').replace('Z', '')
          }
          this.lst_range.push(toadd);
          this.GetAttributes(ef, index);
        });
      },
      e => {
        console.error(e);
      }
    );
  }

  GetEventFramesInit() {
    let url = '';
    if(this.isByTime){
      url = `https://pisrv01.pischool.int/piwebapi/elements/{0}/eventframes?starttime=${this.starttime}&endtime=${this.endtime}`
    } else {
      url ="https://pisrv01.pischool.int/piwebapi/elements/{0}/eventframes?starttime={1}-3d&endtime={1}"
    }

    const body = {
      "0":{
        "Method": "GET",
        "Resource": "https://pisrv01.pischool.int/piwebapi/eventframes/"+this.webidEF
      },
      "1":{
        "Method": "GET",
        "Resource": "https://pisrv01.pischool.int/piwebapi/elements/{0}",
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
        this.starttime = r.body[0].Content.EndTime;
        
        this.webidElement = r.body[1].Content.WebId;
        this.element_ef = r.body[1].Content.Name + ' | ' + this.eftype;

        this.eventFrames = r.body[2].Content.Items.filter(x => x.TemplateName === this.eftype || x.TemplateName.indexOf(this.eftype)+1 || this.eftype.indexOf(x.TemplateName)+1);

        if(!this.isByTime){
          this.eventFrames = this.eventFrames.slice(Math.max(this.eventFrames.length - 3, 1));
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
    this.piWebApiService.eventFrame.getAttributes$(eventFrame.WebId)
    .subscribe(
      r => {
        const attributes = r.Items;
        attributes.forEach(attr => {
          let found = this.lst_attribute.find(x => x.Name && x.Name.toString()===attr.Name.toString());
          if(!found){
            const to_add = {
              Name: attr.Name.toString(),
              Values: [],
              IsManualDataEntry: attr.IsManualDataEntry,
              HasToBeHide: attr.IsHidden || attr.IsExcluded
            };
            this.lst_attribute.push(to_add);
            found = to_add;
          }

          this.GetValueOfAttribute(attr, index, this.lst_attribute.indexOf(found));
          
        });
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
        
        if(value && value.Name){
          value = value.Value;
        }
        this.lst_attribute[index_attr].Values[index] = {
          Value: value,
          idEF: index,
          idAttr: index_attr,
          UnitsAbbreviation: r.UnitsAbbreviation
        };
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
      this.GetEventFrames('ForwardFromStartTime');
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
        const date_m24 = new Date();
        date_m24.setHours(date_m24.getHours() -24);
        this.starttime = date_m24.toISOString();
        this.endtime = new Date().toUTCString();
      } else {
        this.starttime = new Date().toUTCString();
      }

      this.GetEventFrames();
    }

    //go to original
  }

  trackByFn(index, item) {
    return index; // or item.id
  }

}
