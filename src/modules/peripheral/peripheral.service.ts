import Bleno , { PrimaryService, Characteristic, Descriptor  } from '@abandonware/bleno';
import { Injectable, Logger } from '@nestjs/common';


@Injectable()
export class PeripheralService {
  private bleno: typeof Bleno 
  
  private name = 'NestJSPeripheral'
  private serviceUuids = ['6d79686561727473656e74696e656c10']
  private serviceName = 'PeripheralService'
  private masterMacAddess: string | null;
  private state: string = 'poweredOff'

  primaryService: any

  onModuleInit() {
    Logger.log(`Module Loaded`, this.serviceName)
    Logger.log(`Module serviceName ${JSON.stringify(this.serviceName)}`, this.serviceName)
    Logger.log(`Module serviceUuids ${JSON.stringify(this.serviceUuids)}`, this.serviceName)
  
    }

  private stateChange(state: string) {
    Logger.log(`[bleno:state] [${this.bleno.address}] ${state}`, this.serviceName)
  
    this.state = state 

    if(state === 'poweredOn') {


      this.bleno.startAdvertising(this.name, ['6d79686561727473656e74696e656c10'], ( error ) => {
        if(error) throw error 
      })
    } else {
      this.bleno.stopAdvertising()
    }
  }

  public getState() {
    return this.state
  }

  public getName() {
    return this.name
  }

  public getServiceUUID() {
    return this.serviceUuids
  }

  public getMasterAddress() {
    return this.masterMacAddess
  }

  protected onAcceptConnection(data:string) {
    Logger.log(`Connected to ${JSON.stringify(data)}`, this.serviceName)
    this.masterMacAddess= data
  }

  protected onDisconnect(data) {
    Logger.log(`Disconnected from ${JSON.stringify(data)}`, this.serviceName)
    this.masterMacAddess = null
  }

  protected onReadRequest(offset, callback) {
    Logger.log(`[${offset}]`, this.serviceName)
    callback(Characteristic.RESULT_SUCCESS, Buffer.from('PrimaryCharacteristic'))
  }

  protected onWriteRequest(data, offset,withoutResponse, callback ) {
    const json_data = JSON.parse(data.toString());
    Logger.log(`[${offset}] Write Request: ${JSON.stringify(json_data, null, 2)}`, this.serviceName)
    callback(Characteristic.RESULT_SUCCESS)
  }

  private onAdvertisingStart(error){
    if(error) throw error
    
    Logger.log(`Starting to advertise`, this.serviceName)
    this.bleno.setServices([
      new this.bleno.PrimaryService({
        uuid: '6d79686561727473656e74696e656c10', // or 'fff0' for 16-bit
        characteristics: [
          new this.bleno.Characteristic({
            value: null,
            //@ts-ignore
            name: "SetupCharacteristic",
            descriptors: [
              new Descriptor({
                uuid: '2901',
                value: 'SetupCharacteristic' // static value, must be of type Buffer or string if set
            })
            ],
            uuid: 'ffffffffffffff1' ,
            properties: ['read', 'write'],
              onReadRequest: this.onReadRequest.bind(this), // optional read request handler, function(offset, callback) { ... }
              onWriteRequest: this.onWriteRequest.bind(this), // optional write request handler, function(data, offset, withoutResponse, callback) { ...}
              onSubscribe: null, // optional notify/indicate subscribe handler, function(maxValueSize, updateValueCallback) { ...}
              onUnsubscribe: null, // optional notify/indicate unsubscribe handler, function() { ...}
              onNotify: null, // optional notify sent handler, function() { ...}
              onIndicate: null // optional indicate confirmation received handler, function() { ...}
          })
        ]
      })  


    ])

  
  }

  constructor() {
    this.bleno  = require('@abandonware/bleno')
    this.bleno.on('stateChange', this.stateChange.bind(this))
    this.bleno.on('advertisingStart', this.onAdvertisingStart.bind(this))
    this.bleno.on('accept', this.onAcceptConnection.bind(this))
    this.bleno.on('disconnect', this.onDisconnect.bind(this))
    this.bleno.on('servicesSetError', (e) => {
      console.error('servicesSetError',e)
    })


    

    
  }

}
