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
    @Input() urlPiWebApi: string;
    @Output() askToClose: EventEmitter<any> = new EventEmitter<any>();

    constructor(){}

    ngOnInit(){

    }

    ngOnDestroy(){

    }

    ngOnChanges(changes){
        
    }
}