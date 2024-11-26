import cron from "node-cron";
import { sendEmail } from "../utils/emailSender.js";
import { Job } from "../Models/jobSchema.js";
import {User} from "../Models/userSchema.js";

export const newsLetterCron = ()=>{
    cron.schedule("*/1 * * * *", async()=>{
        const jobs = await Job.find({newsLetterSent: false});
        console.log("Crone running");
        console.log(jobs);
        for(const job of jobs){
            try{
                const filterUsers = await User.find({
                    $or:[
                        {"preferences.firstPreference": job.jobNiche},
                        {"preferences.secondPreference": job.jobNiche},
                        {"preferences.thirdPreference": job.jobNiche},
                    ]
                });
                for(const user of filterUsers){
                    const subject = `Hot Job Alert: ${job.title} in ${job.jobNiche} Available Now`;
                    const message = `Hi ${user.name},\n\nGreat news!\n
                    A new job that fits your preference has just been posted. The position is for a ${job.title} with ${job.companyName}, and they are looking to hire immediately.\n\nJob Details:\n- **Position:** ${job.title}\n- **Company:** ${job.companyName}\n- **Location:** ${job.location}\n- **Salary:** ${job.salary}\n\nDon’t wait too long! Job openings like these are filled quickly. \n\nWe’re here to support you in your job search. Best of luck!
                    \n\nBest Regards,\nNicheNest Team`;
                    sendEmail({
                        email: user.email,
                        subject,
                        message,
                    });
                }
                job.newsLetterSent = true;
                await job.save();
            }
            catch(err){
                console.log("ERROR IN NODE CRON CATCH BLOCK");
                return next(console.error(error || "Some Error in Cron."));
            }
        }
    });
}