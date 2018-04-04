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

// const routes: Router = [];

@NgModule({
  declarations: [ExampleComponent, DrawDataComponent, ExtractDataComponent, ConfigPanelComponent, DataGridComponent ],
  imports: [ CommonModule, FormsModule, RouterModule ],
  exports: [ExampleComponent, DrawDataComponent, ExtractDataComponent, ConfigPanelComponent , DataGridComponent ],
  entryComponents: [ExampleComponent, DrawDataComponent, ExtractDataComponent, ConfigPanelComponent, DataGridComponent  ]
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
            { propName: 'isMasterEvent', displayName: 'Is Master Event', configType: ConfigPropType.Flag, defaultVal: true },
            { propName: 'primaryEvent',  displayName: 'Primary Event', configType: ConfigPropType.Listbox,
            configItems: [
              { text: 'Downtime', value: 'downtime' },
              { text: 'Production', value: 'production'}
            ],
            defaultVal: 'production' },
            { propName: 'defaultEventHeight', displayName: 'Default Event Height', configType: ConfigPropType.Num, defaultVal: 50 },
            { propName: 'bkColor', displayName: 'Background', configType: ConfigPropType.Color, defaultVal: 'white' },
            { propName: 'lineColor', displayName: 'Line Color', configType: ConfigPropType.Color, defaultVal: '#58a3b6' },
            { propName: 'startTimeCustom', displayName: 'Start Time', configType: ConfigPropType.Time },
            { propName: 'endTimeCustom', displayName: 'End Time', configType: ConfigPropType.Time },
            { propName: 'minimumEventPixelWidth', displayName: 'Min Event Width', configType: ConfigPropType.Num, defaultVal: 25 },
            { propName: 'showAttrInEventWidth', displayName: 'Event Width To Show Attr', configType: ConfigPropType.Num, defaultVal: 20 }
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
      name: 'extract-data-symbol',
      displayName: 'Extract Data Symbol',
      dataParams: { shape: 'single' },
      thumbnail: '^/assets/images/example.svg',
      compCtor: ExtractDataComponent,
      inputs: [
        SymbolInputType.Data,
        SymbolInputType.PathPrefix
      ],
      generalConfig: [
        {
          name: 'Extract Data Options',
          isExpanded: true,
          configProps: [
            { propName: 'bkColor', displayName: 'Background color', configType: ConfigPropType.Color, defaultVal: 'white' },
            { propName: 'fgColor', displayName: 'Color', configType: ConfigPropType.Color, defaultVal: 'black' },
            { propName: 'serverName', displayName: 'Server Name', configType: ConfigPropType.Text, defaultVal: 'PISRV01' }
          ]
        }
      ],
      customProps: [
        { propName: 'elementEfAttr', defaultVal: null }
      ],
      menuCommands: [
      ],
      configCtors: [
        ConfigPanelComponent
      ],
      layoutWidth: 200,
      layoutHeight: 100
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
            { propName: 'serverName', displayName: 'Server Name', configType: ConfigPropType.Text, defaultVal: 'PISRV01' }
          ]
        }
      ],
      layoutWidth: 200,
      layoutHeight: 100
    }
  ];
}
