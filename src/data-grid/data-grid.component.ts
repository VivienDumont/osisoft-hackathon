/**
 * @license
 * Copyright © 2017-2018 OSIsoft, LLC. All rights reserved.
 * Use of this source code is governed by the terms in the accompanying LICENSE file.
 */
import { Component, Input, OnChanges } from '@angular/core';
// import { DxDataGridModule, DxDataGridComponent } from 'devextreme-angular';


@Component({
  selector: 'example',
  templateUrl: 'data-grid.component.html',
  styleUrls: ['data-grid.component.css']
})
export class DataGridComponent implements OnChanges {
  @Input() fgColor: string;
  @Input() bkColor: string;
  @Input() data: any;
  @Input() pathPrefix: string;
  values: any[];

  ngOnChanges(changes) {
    if (changes.data) {
    }
  }


}
