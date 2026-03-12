import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ip_info')
export class Ip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 45, unique: true })
  ip: string;

  @Column()
  network: string;

  @Column()
  version: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  region_code: string;

  @Column()
  country: string;

  @Column()
  country_name: string;

  @Column({ length: 2 })
  country_code: string;

  @Column({ length: 3 })
  country_code_iso3: string;

  @Column()
  country_capital: string;

  @Column({ nullable: true })
  country_tld: string;

  @Column({ length: 2 })
  continent_code: string;

  @Column()
  in_eu: boolean;

  @Column({ nullable: true })
  postal: string;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @Column()
  timezone: string;

  @Column()
  utc_offset: string;

  @Column()
  country_calling_code: string;

  @Column()
  currency: string;

  @Column()
  currency_name: string;

  @Column()
  languages: string;

  @Column('float')
  country_area: number;

  @Column('bigint')
  country_population: number;

  @Column()
  asn: string;

  @Column()
  org: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
