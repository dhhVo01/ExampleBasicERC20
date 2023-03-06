import { Contact } from "../model/contact.model"
import { Education } from "../model/education.model";
import { Interest } from "../model/interest.model";
import { Objective } from "../model/objective.model";
import { Project } from "../model/project.model";
import { Skill } from "../model/skill.model";
import { SocialMedia } from "../model/socialMedia.model";
import { Request, Response } from 'express';
import { client } from "../server";
import requestIp from 'request-ip';




async function checkIpAddress(ip: string | null) {
    if (ip) {
        try {
            const isExist = await client.hExists("ip_counts", ip);
            if (isExist) {
                await client.hIncrBy("ip_counts", ip, 1);
            } else {
                await client.hSet("ip_counts", ip, 1);
            }
            await client.hIncrBy("ip_counts", "total_count", 1);
            const visitor = {
                visitor_ip: ip,
                access_log: await client.hGet("ip_counts", ip),
                total_access_log: await client.hGet("ip_counts", "total_count")
            };
            return visitor;
        } catch (err) {
            console.log(err);
            await client.hIncrBy("ip_counts", "total_count", 1);
        }
    }
    const visitor = {
        visitor_ip: ip,
        access_log: "Failed to update Redis",
        total_access_log: await client.hGet("ip_counts", "total_count")
    };
    return visitor;
}
const getCurrentAccessTime = () => {
    const date = new Date();
    const [month, day, year] = [
        date.getMonth(),
        date.getDate(),
        date.getFullYear(),
    ];
    const [hour, minutes, seconds] = [
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
    ];
    const amOrPm = hour < 12 ? 'AM' : 'PM';
    return `${day}-${month}-${year}, ${hour}:${minutes}:${seconds} ${amOrPm}`
}

export const getDataProfile = async (req: Request, res: Response) => {
    const ipAddress = requestIp.getClientIp(req);
    const visitor_data = await checkIpAddress(ipAddress);
    const currentAccessTime = getCurrentAccessTime();
    const lastRecentAccess = await client.get("access_time");
    await client.set("access_time", currentAccessTime + ` (By IP ${ipAddress})`);
    try {
        const contacts = await Contact.find({});
        const objectives = await Objective.find({});
        const educations = await Education.find({});
        const skills = await Skill.find({});
        const interests = await Interest.find({});
        const projects = await Project.find({});
        const SocialMedias = await SocialMedia.find({});
        const data: any = {
            contact: contacts,
            objective: objectives,
            education: educations,
            skill: skills,
            interest: interests,
            project: projects,
            SocialMedia: SocialMedias,
            Visitor: visitor_data,
            lastRecentAccess: lastRecentAccess
        }
        await client.set("data", data.toString());
        res.send(data);
    } catch (err) {
        const dataInRedis = await client.get("data");
        res.send(JSON.stringify(dataInRedis));

    }
}