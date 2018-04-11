import { NgModule, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes, Router } from '@angular/router';
// import { DxDataGridModule, DxDataGridComponent } from 'devextreme-angular';

import { NgLibrary, SymbolType, SymbolInputType, ConfigPropType } from './framework';
import { LibModuleNgFactory } from './module.ngfactory';

import { ExampleComponent } from './example/example.component';
import { ExtractDataComponent } from './extract-data/extract-data.component';
import { DrawDataComponent } from './draw-data/draw-data.component';
import { ConfigPanelComponent } from './config-panel/config-panel.component';
import { DataGridComponent } from './data-grid/data-grid.component';
import { ReasonTreeComponent } from './reason-tree/reason-tree.component';
import { EventFrameZommComponent } from './eventframe-zoom/eventframe-zoom.component';

// const routes: Router = [];

@NgModule({
  declarations: [ ExampleComponent, DrawDataComponent, ExtractDataComponent, ConfigPanelComponent, DataGridComponent, ReasonTreeComponent, EventFrameZommComponent ],
  imports: [ CommonModule, FormsModule, RouterModule.forRoot([]) ],
  exports: [ ExampleComponent, DrawDataComponent, ExtractDataComponent, ConfigPanelComponent , DataGridComponent, ReasonTreeComponent, EventFrameZommComponent ],
  entryComponents: [ ExampleComponent, DrawDataComponent, ExtractDataComponent, ConfigPanelComponent, DataGridComponent, ReasonTreeComponent, EventFrameZommComponent ]
})

export class LibModule { }

export class ExtensionLibrary extends NgLibrary {

  module = LibModule;
  moduleFactory = LibModuleNgFactory;
  symbols: SymbolType[] = [
    {
      name: 'draw-data-symbol',
      displayName: 'DrawData Symbol',
      dataParams: { shape: 'single' },
      thumbnail: '^/assets/images/Symasol.png',
      compCtor: DrawDataComponent,
      inputs: [
        SymbolInputType.Data,
        SymbolInputType.PathPrefix,
      ],
      autoEventBindings:[
        
      ],
      generalConfig: [
        {
          name: 'DrawData Options',
          isExpanded: true,
          configProps: [
            { propName: 'defaultEventHeight', displayName: 'Default Event Height', configType: ConfigPropType.Num, defaultVal: 50 },
            { propName: 'bkColor', displayName: 'Background', configType: ConfigPropType.Color, defaultVal: 'white' },
            { propName: 'lineColor', displayName: 'Band Color', configType: ConfigPropType.Color, defaultVal: '#58a3b6' },
            { propName: 'minimumEventPixelWidth', displayName: 'Min Event Width', configType: ConfigPropType.Num, defaultVal: 25 },
            { propName: 'showAttrInEventWidth', displayName: 'Event Width To Show Attr', configType: ConfigPropType.Num, defaultVal: 20 },
            { propName: 'datagridDisplay', displayName: 'Data Grid Display', configType: ConfigPropType.DocumentUrl },
            { propName: 'urlPiWebApi', displayName: 'PiWebApi', configType: ConfigPropType.Text, defaultVal: 'https://pisrv01.pischool.int/piwebapi' }
          ]
        },
      ],
      configCtors: [
        ConfigPanelComponent
      ],
      customProps: [
        {
          propName: 'elementEfAttr', defaultVal: null
        }
      ],
      layoutWidth: 700,
      layoutHeight: 600
    },
    {
      name: 'data-grid-symbol',
      displayName: 'Data Grid Symbol',
      dataParams: { shape: 'single' },
      thumbnail: '^/assets/images/example.svg',
      compCtor: DataGridComponent,
      inputs: [
        SymbolInputType.Data,
        SymbolInputType.PathPrefix
      ],
      generalConfig: [
        {
          name: 'Data Grid Options',
          isExpanded: true,
          configProps: [
            { propName: 'bkColor', displayName: 'Background color', configType: ConfigPropType.Color, defaultVal: 'white' },
            { propName: 'fgColor', displayName: 'Color', configType: ConfigPropType.Color, defaultVal: 'black' },
            { propName: 'urlPiWebApi', displayName: 'PiWebApi', configType: ConfigPropType.Text, defaultVal: 'https://pisrv01.pischool.int/piwebapi' }
          ]
        }
      ],
      layoutWidth: 200,
      layoutHeight: 100
    }
  ];
}
