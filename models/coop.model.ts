import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ColumnNumericTransformer } from '../../../sys/base/base.model';

    //  `coop`.`coop_id`,
    // `coop`.`coop_name`,
    // `coop`.`coop_guid`,
    // `coop`.`coop_type_id`,
    // `coop`.`coop_enabled`,
    // `coop`.`company_id`,
    // `coop`.`cd_geo_location_id`

@Entity(
    {
        name: 'coop',
        synchronize: false
    }
)
export class CoopModel {
    @PrimaryGeneratedColumn(
        {
            name: 'coop_id'
        }
    )
    coopId?: number;

    @Column({
        name: 'coop_guid',
        length: 36,
        default: uuidv4()
    })
    coopGuid?: string;

    @Column(
        {
            name: 'coop_name',
            length: 50,
            nullable: true
        }
    )
    coopName: string;

    @Column(
        {
            name: 'coop_description',
            length: 60,
            default: null
        })
    coopDescription: string;

    @Column(
        {
            name: 'doc_id',
            default: null
        }
    )
    docId?: number;

    @Column(
        {
            name: 'coop_type_id',
            default: null
        }
    )
    coopTypeId?: number;

    @Column(
        {
            name: 'company_id',
            default: null
        }
    )
    companyId?: number;

    /**
     * this is the geo-scope of a given coop...or SACCO or Credit Union
     */
    @Column(
        {
            name: 'cd_geo_location_id',
            default: null
        }
    )
    cdGeoLocationId?: number;

    @Column(
        'boolean',
        {
            name: 'coop_enabled',
            default: null
        }
    )
    coopEnabled?: boolean;

    
}
