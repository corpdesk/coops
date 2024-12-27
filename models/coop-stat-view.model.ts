import { ViewEntity, ViewColumn } from 'typeorm';
import { IQuery } from '../../../sys/base/IBase';

export function siGet(q: IQuery) {
    return {
        serviceModel: CoopStatViewModel,
        docName: 'CoopStatModel::siGet',
        cmd: {
            action: 'find',
            query: q
        },
        dSource: 1
    }
}


@ViewEntity({
    name: 'coop_stat_view',
    synchronize: false,
    expression: `
    SELECT 
        'coop_stat'.'coop_stat_id' AS 'coop_id',
        'coop_stat'.'coop_stat_guid' AS 'coop_guid',
        'coop_stat'.'coop_stat_name' AS 'coop_name',
        'coop_stat'.'coop_stat_description' AS 'coop_description',
        'coop_stat'.'doc_id' AS 'doc_id',
        'coop_stat'.'coop_type_id' AS 'coop_type_id',
        'coop_stat'.'cd_geo_location_id' AS 'cd_geo_location_id',
        'coop_stat'.'coop_count' AS 'coop_count',
        'coop_stat'.'coop_members_count' AS 'coop_members_count',
        'coop_stat'.'coop_saves_shares' AS 'coop_saves_shares',
        'coop_stat'.'coop_loans' AS 'coop_loans',
        'coop_stat'.'coop_assets' AS 'coop_assets',
        'coop_stat'.'coop_member_penetration' AS 'coop_member_penetration',
        'coop_stat'.'coop_stat_date_label' AS 'coop_date_label',
        'coop_stat'.'coop_woccu' AS 'coop_woccu',
        'coop_stat'.'coop_reserves' AS 'coop_reserves',
        'coop_stat'.'coop_stat_enabled' AS 'coop_enabled',
        'coop_stat'.'coop_stat_display' AS 'coop_display',
        'coop_stat'.'coop_stat_ref_id' AS 'coop_ref_id',
        'coop_type'.'parent_guid' AS 'parent_guid',
        'coop_type'.'coop_type_name' AS 'coop_type_name',
        'cd_geo_location'.'cd_geo_location_name' AS 'cd_geo_location_name',
        'cd_geo_location'.'cd_geo_location_enabled' AS 'cd_geo_location_enabled',
        'cd_geo_location'.'cd_geo_location_display' AS 'cd_geo_location_display',
        'cd_geo_location'.'cd_geo_political_type_id' AS 'cd_geo_political_type_id'
    FROM
        (('coop_stat'
        JOIN 'coop_type' ON (('coop_type'.'coop_type_id' = 'coop_stat'.'coop_type_id')))
        JOIN 'cd_geo_location' ON (('cd_geo_location'.'cd_geo_location_id' = 'coop_stat'.'cd_geo_location_id')))
    `
})


export class CoopStatViewModel {
    @ViewColumn(
        {
            name: 'coop_stat_id'
        }
    )
    coopStatId: number;

    @ViewColumn(
        {
            name: 'coop_stat_guid'
        }
    )
    coopStatGuid: number;

    @ViewColumn(
        {
            name: 'coop_stat_name'
        }
    )
    coopStatName: string;

    @ViewColumn(
        {
            name: 'coop_type_guid'
        }
    )
    coopTypeGuid: string;

    @ViewColumn(
        {
            name: 'coop_type_name'
        }
    )
    coopTypeName: string;

    @ViewColumn(
        {
            name: 'doc_id'
        }
    )
    docId: number;

    @ViewColumn(
        {
            name: 'coop_stat_description'
        }
    )
    coopStatDescription: string;


    @ViewColumn(
        {
            name: 'coop_type_id'
        }
    )
    coopTypeId: number;

    @ViewColumn(
        {
            name: 'cd_geo_location_id'
        }
    )
    cdGeoLocationId: number;

    @ViewColumn(
        {
            name: 'coop_count'
        }
    )
    coopCount: number;

    @ViewColumn(
        {
            name: 'coop_members_count'
        }
    )
    coopMembersCount: number;

    @ViewColumn(
        {
            name: 'coop_saves_shares'
        }
    )
    coopSavesShares: number;

    @ViewColumn(
        {
            name: 'coop_loans'
        }
    )
    coopLoans: number;

    @ViewColumn(
        {
            name: 'coop_assets'
        }
    )
    coopAssets: number;

    @ViewColumn(
        {
            name: 'coop_member_penetration'
        }
    )
    coopMemberPenetration: number;

    @ViewColumn(
        {
            name: 'coop_stat_date_label'
        }
    )
    coopStatDateLabel: number;

    @ViewColumn(
        {
            name: 'coop_woccu'
        }
    )
    coopWoccu: boolean;

    @ViewColumn(
        {
            name: 'coop_reserves'
        }
    )
    coopReserves: number;



    @ViewColumn(
        {
            name: 'parent_guid'
        }
    )
    parentGuid: string;


    @ViewColumn(
        {
            name: 'cd_geo_location_name'
        }
    )
    cdGeoLocationName: string;


    @ViewColumn(
        {
            name: 'cd_geo_political_type_id'
        }
    )
    cdGeoPoliticalTypeId: string;

    @ViewColumn(
        {
            name: 'coop_stat_enabled'
        }
    )
    coopStatEnabled: boolean;

    @ViewColumn(
        {
            name: 'coop_stat_display'
        }
    )
    coopStatDisplay: boolean;

    @ViewColumn(
        {
            name: 'coop_stat_ref_id'
        }
    )
    coopStatRefId: number;

    @ViewColumn(
        {
            name: 'cd_geo_location_enabled'
        }
    )
    cdGeoLocationEnabled: boolean;

    @ViewColumn(
        {
            name: 'cd_geo_location_display'
        }
    )
    cdGeoLocationDisplay: boolean;

}