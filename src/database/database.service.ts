import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(private datasource: DataSource) {}

  onModuleInit() {
    if (this.datasource.isInitialized) {
      console.log('Successfully connected to the database');
    } else {
      console.error('Failed to connect to the database');
      throw new Error('Database connection not initialized');
    }
  }
}
