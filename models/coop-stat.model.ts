import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ColumnNumericTransformer } from '../../../sys/base/base.model';


@Entity(
    {
        name: 'coop_stat',
        synchronize: false
    }
)
export class CoopStatModel {
    @PrimaryGeneratedColumn(
        {
            name: 'coop_stat_id'
        }
    )
    coopStatId?: number;

    @Column({
        name: 'coop_stat_guid',
        length: 36,
        default: uuidv4()
    })
    coopStatGuid?: string;

    @Column(
        {
            name: 'coop_stat_name',
            length: 50,
            nullable: true
        }
    )
    coopStatName: string;

    @Column(
        {
            name: 'coop_stat_description',
            length: 60,
            default: null
        })
    coopStatDescription: string;

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
            name: 'cd_geo_location_id',
            default: null
        }
    )
    cdGeoLocationId?: number;

    @Column(
        {
            name: 'coop_count',
            default: null
        }
    )
    coopCount?: number;

    @Column(
        {
            name: 'coop_members_count',
            default: null
        }
    )
    coopMembersCount?: number;

    @Column(
        {
            name: 'coop_saves_shares',
            default: null
        }
    )
    coopSavesShares?: number;

    @Column(
        {
            name: 'coop_loans',
            default: null
        }
    )
    coopLoans?: number;

    @Column(
        {
            name: 'coop_assets',
            default: null
        }
    )
    coopAssets?: number;

    @Column(
        'numeric', {
        name: 'coop_member_penetration',
        precision: 7,
        scale: 2,
        default: null,
        transformer: new ColumnNumericTransformer(),
    })
    coopMemberPenetration: number;

    @Column(
        {
            name: 'coop_stat_date_label',
            default: null
        }
    )
    coopStatDateLabel?: string;

    @Column(
        'boolean',
        {
            name: 'coop_woccu',
            default: null
        }
    )
    coopWoccu?: boolean;

    @Column(
        {
            name: 'coop_reserves',
            default: null
        }
    )
    coopReserves?: number;

    @Column(
        {
            name: 'coop_stat_ref_id',
            default: null
        }
    )
    coopStatRefId?: number;

    @Column(
        'boolean',
        {
            name: 'coop_stat_enabled',
            default: null
        }
    )
    coopStatEnabled?: boolean;

    @Column(
        'boolean',
        {
            name: 'coop_stat_display',
            default: null
        }
    )
    coopStatDisplay?: boolean;


}
