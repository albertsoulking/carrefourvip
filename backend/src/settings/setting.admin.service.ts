import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Setting } from './entity/setting.entity';
import { Repository } from 'typeorm';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Admin } from 'src/admin/entities/admin.entity';
import { LogService } from 'src/system_log/log.service';
import { Request } from 'express';
import { UserType } from 'src/login-activities/enum/login-activities.enum';
import { SearchSettingDto } from './dto/search-setting.dto';

@Injectable()
export class SettingAdminService {
    constructor(
        @InjectRepository(Setting)
        private readonly settingRepo: Repository<Setting>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
        private readonly logService: LogService
    ) {}

    async update(adminId: number, req: Request, dto: UpdateSettingDto) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        const setting = await this.settingRepo.findOne({
            where: { group: dto.group, key: dto.key }
        });
        if (!setting) throw new NotFoundException('Invalid Settings!');

        await this.logService.logAdminAction(req, {
            adminId: admin.id,
            userType: UserType.ADMIN,
            action: '更新设置',
            targetType: '设置',
            targetId: setting.id,
            description: `[${admin.name}] 更新了设置: 组=${dto.group}, 键=${dto.key}, 值=${dto.value}。`
        });

        return await this.settingRepo.update(setting.id, dto);
    }

    async get(adminId: number, dto: SearchSettingDto) {
        const admin = await this.adminRepo.findOne({
            where: { id: adminId }
        });
        if (!admin)
            throw new NotFoundException(`Admin ID ${adminId} not found!`);

        const setting = await this.settingRepo.findOne({
            where: {
                key: dto.key,
                group: dto.group
            }
        });
        if (!setting) return {};

        return setting.value;
    }

    async reset() {
        const data = [
            {
                group: 'setting',
                key: 'website',
                value: JSON.stringify({
                    logo: '1757850038795-p7c8k8j0m.png',
                    homepageBanner:
                        '1757850318994-3ong9wwq0.jpg,1757850330414-rq1is82s9.jpg,1757850334742-e02152ldu.jpg,1757850358672-kzlmq2354.jpg,1757850362157-e5ih319ez.jpg,1757850365408-2xquy8id0.jpg,1757850368582-8yd1va504.jpg,1757850373504-s01s2uj95.jpg,1757850378482-5dhc6w3h5.jpg,1757850381206-21s48gqpo.jpg,1757850386047-qi6yhk2pt.jpg,1757850389929-03jcws2y3.jpg,1757850393204-4k95f0zzl.jpg,1757850398171-jzqsenlim.jpg,1757850401309-bnkjhufh1.jpg,1757850404459-4u74mncdj.jpg,1757850408444-mqcrkpyxw.jpg,1757850411868-orm5c8d1c.jpg,1757850415597-wwpgx0rq1.jpg,1757850420469-u7ze8uwqe.jpg,1757850424650-2jnzttfj8.jpg,1757850429199-x3mg9mfu3.jpg,1757850434123-ceyk9d6o0.jpg,1757850437773-2v05htkdh.jpg,1757850442819-7iorytxyy.jpg,1757850446627-5yxlzejcx.jpg,1757850452542-qoqe9an9x.jpg,1757850456531-vc8tufr36.jpg,1757850461866-0xb35zwf9.jpg,1757850579367-4wt21flla.jpg,1757850624957-czawkaqh3.jpg,1757850630305-eq4zc2wef.jpg,1757850633766-8aft1q0am.jpg,1757850639528-4y8k0upjc.jpg,1757850645496-oryu5awrq.jpg,1757850649760-szxgewhcr.jpg,1757850653383-xsmcvpfc9.jpg,1757850659215-cwmr1mj54.jpg,1757850666865-dgmdz5cex.jpg,1757850673273-y3wg91p1o.jpg,1757850678514-e71c5l2ul.jpg,1757850683248-vpi29b0d5.jpg,1757850689888-my7fpwy2i.jpg,1757850695184-tzavyr4cn.jpg,1757850699818-skesszxcn.jpg,1757850706656-ohzr672tm.jpg,1757850711976-xezmcmhsc.jpg,1757850717404-ws2phdj5a.jpg,1757850724278-6dywl350r.jpg,1757850730218-qg83zljd0.jpg,1757850753145-0s3c6hpin.jpg,1757850761121-f2uro58f6.jpg,1757850770219-ordo4n6nm.jpg,1757850777553-bxfrfmf0g.jpg,1757850784064-91mdp5xxo.jpg,1757850789484-cbqvhm733.jpg,1757850802068-7f1a5mmju.jpg,1757850808001-9abdi2nwj.jpg,1757850812861-6s7mtrjsh.jpg,1757850819240-pn32gbhqo.jpg,1757850830533-gx5km88xo.jpg,1757850837703-b24cg0iog.jpg,1757850842928-ianci8l05.jpg,1757850852359-zce04pial.jpg,1757850857610-jy8onxgqw.jpg,1757850863243-2osuryv9r.jpg,1757850870182-jvf1yn7qc.jpg,1757850880962-dqmo0id8e.jpg,1757850886501-btauf3i4h.jpg,1757850893560-05atsf5lg.jpg,1757850900403-v31g8m2vx.jpg,1757850906354-r7d1zgt6v.jpg,1757850912050-uqfo29xs5.jpg,1757850917712-vswkj9bc3.jpg,1757850922857-6zvkzeovg.jpg,1757850927508-a2e9n2pfb.jpg,1757850953186-6zivilcg6.jpg,1757850965384-uz6bm7oy9.jpg,1757850972219-ccpreczak.jpg,1757850976489-akw5b95sb.jpg,1757850985165-p209fccfk.jpg,1757850988891-rjz3n6q1l.jpg,1757850993406-2g4ghlb97.jpg,1757850996765-s11e5o6ii.jpg,1757851000667-5na3c7lr1.jpg,1757851004381-quaj4cun9.jpg,1757851008466-cv2bfnmny.jpg,1757851011683-14nn7qfym.jpg,1757851015771-4foev6l14.jpg,1757851019183-vmc7qi03p.jpg,1757851023288-mlg6ima4x.jpg,1757851026778-xfuv1qci7.jpg,1757852622936-ly4qirptw.jpg',
                    vatEnabled: true,
                    deliveryFeeEnabled: true,
                    deliveryAddressEnabled: true
                }),
                remark: '网站通用设置'
            },
            {
                group: 'setting',
                key: 'delivery',
                value: JSON.stringify({
                    deliveryRules: [
                        {
                            name: 'Standard',
                            code: 'standard',
                            remark: '',
                            minStandard: 0,
                            minAdvanced: 50,
                            minFree: 300,
                            maxStandard: 49,
                            maxAdvanced: 299,
                            maxFree: '',
                            feeStandard: 9.99,
                            feeAdvanced: 6.99,
                            feeFree: 0,
                            processingDelayMin: 0.02,
                            processingDelayMax: 0.05,
                            shippedDelayMin: 0.25,
                            shippedDelayMax: 0.35,
                            deliveredDelayMin: 24,
                            deliveredDelayMax: 48,
                            autoCancelUnpaidHours: 48,
                            prcoessingDelayMin: 0.02
                        },
                        {
                            name: 'Express',
                            code: 'express',
                            remark: '',
                            minStandard: 20,
                            minAdvanced: 300,
                            minFree: 1000,
                            maxStandard: 299,
                            maxAdvanced: 999,
                            maxFree: '',
                            feeStandard: 5.99,
                            feeAdvanced: 3.99,
                            feeFree: 0,
                            processingDelayMin: 0.02,
                            processingDelayMax: 0.05,
                            shippedDelayMin: 0.2,
                            shippedDelayMax: 0.25,
                            deliveredDelayMin: 0.5,
                            deliveredDelayMax: 0.8,
                            autoCancelUnpaidHours: 72,
                            prcoessingDelayMin: 0.02
                        }
                    ],
                    restrictedCountries: [
                        { city: 'Paris', country: 'France' },
                        { city: 'Geneva', country: 'Switzerland' },
                        { city: 'London', country: 'UK' },
                        { city: 'Bangkok', country: 'Thailand' }
                    ],
                    businessHours: [
                        { name: 'Monday', open: '16:00', close: '04:00' },
                        { name: 'Tuesday', open: '16:00', close: '04:00' },
                        { name: 'Wednesday', open: '16:00', close: '04:00' },
                        { name: 'Thursday', open: '16:00', close: '04:00' },
                        { name: 'Friday', open: '16:00', close: '04:00' },
                        { name: 'Saturday', open: '16:00', close: '04:00' },
                        { name: 'Sunday', open: '16:00', close: '04:00' }
                    ]
                }),
                remark: '配送相关设置'
            }
        ];

        await this.settingRepo.clear();
        await this.settingRepo.save(data);
    }
}
