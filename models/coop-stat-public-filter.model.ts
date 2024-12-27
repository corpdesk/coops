import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BeforeInsert,
    BeforeUpdate,
    OneToMany
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
    validateOrReject,
} from 'class-validator';


@Entity(
    {
        name: 'coop_stat_public_filter',
        synchronize: false
    }
)
// @CdModel
export class CoopStatPublicFilterModel {

    @PrimaryGeneratedColumn(
        {
            name: 'coop_stat_public_filter_id'
        }
    )
    coopStatPublicFilterId?: number;

    @Column({
        name: 'coop_stat_public_filter_guid',
        type: 'char',
        length: 36,
        nullable: false,
        default: () => uuidv4(),
    })
    coopStatPublicFilterGuid?: string;

    @Column(
        'varchar',
        {
            name: 'coop_stat_public_filter_name',
            length: 50,
            nullable: true
        }
    )
    coopStatPublicFilterName?: string;

    @Column(
        'varchar',
        {
            name: 'coop_stat_public_filter_description',
            length: 50,
            nullable: true
        }
    )
    coopStatPublicFilterDescription?: string;

    @Column(
        {
            name: 'doc_id',
            default: null
        })
    docId?: number;

    @Column(
        {
            type: 'json', 
            name: 'coop_stat_public_filter_specs',
            nullable: true
        }
    )
    coopStatPublicFilterSpecs?: object | string | coopStatPublicFilterSpecs;

    @Column(
        {
            name: 'coop_stat_public_filter_enabled',
            nullable: true
        }
    )
    coopStatPublicFilterEnabled?: boolean;
}

export interface coopStatPublicFilterSpecs {
    where: {
        coopTypeId?: number;
        coopStatRefId?: number;
        cdGeoLocationId?: number;
        coopStatDateLabel?: Date;
        cdGeoPoliticalTypeId?: number;
    };
    update: {
        coopStatEnabled: true;
        coopStatDisplay: true;
    };
    exempted: IExemptedItem[]; // Updated to allow arrays with any length
}

export interface IExemptedItem {
    guid: string, // guid identity
    cdObjId: number, // id of user or group
    cdObjName?: string | null, // name of user or group
    cdObjTypeId?: number, // determines whether it is user, 9 or group, 10
}
