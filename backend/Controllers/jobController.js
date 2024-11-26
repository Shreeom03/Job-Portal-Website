import {catchAsyncErrors} from "../Middlewares/catchAsyncErrors.js";
import ErrorHandler from "../Middlewares/ErrorMiddleWare.js";
import {Job} from "../Models/jobSchema.js";

export const postJob = catchAsyncErrors(async(req, res , next)=>{
    const {
        title,
        jobType,
        location,
        companyName,
        introduction,
        responsibilities,
        qualifications,
        offers,
        salary,
        hiringMultipleCandidates,
        personalWebsiteTitle,
        personalWebsiteUrl,
        jobNiche,
    } = req.body;

    if(!title ||
        !jobType ||
        !location ||
        !companyName ||
        !introduction ||
        !responsibilities ||
        !qualifications ||
        !salary ||
        !jobNiche){
            return next(new ErrorHandler("Please provide all the required information", 400));
        }

        if((!personalWebsiteTitle && personalWebsiteUrl) || (personalWebsiteTitle && !personalWebsiteUrl)){
            return next(new ErrorHandler("Either please provide both website tile and url or please leave both blank", 400));
        }

        const postedBy = req.user._id;
        const job = await Job.create({
            title,
        jobType,
        location,
        companyName,
        introduction,
        responsibilities,
        qualifications,
        offers,
        salary,
        hiringMultipleCandidates,
        personalWebsite: {
            title: personalWebsiteTitle,
            url:personalWebsiteTitle,
        },
        personalWebsiteUrl,
        jobNiche,
        postedBy,
        });

        res.status(201).json({
            success: true,
            message: "Job Created Succesfully",
            job
        });
});

export const getAllJobs = catchAsyncErrors(async(req, res, next)=>{
    const {city, preferences, searchKeyword} = req.query;
    const query = {};
    if(city){
        query.location = city;
    }

    if(preferences){
        query.jobNiche = preferences; 
    }

    if(searchKeyword){
       query.$or = [
        {title: {$regex: searchKeyword, $options: "i"}},
        {companyName: {$regex: searchKeyword, $options: "i"}},
        {introduction: {$regex: searchKeyword, $options: "i"}},
       ]; 
    }
    const jobs = await Job.find(query);
    res.status(200).json({
        success:true,
        jobs,
        count: jobs.length,
    });
});
export const getMyJobs = catchAsyncErrors(async(req, res, next)=>{
    const myJobs = await Job.find({postedBy: req.user._id});
    res.status(200).json({
        success:true,
        myJobs,
    });
}); 
export const deleteJob  = catchAsyncErrors(async(req, res, next)=>{
    const {id} = req.params;
    const job = await Job.findById(id);
    if(!job){
        return next(new ErrorHandler("Job Not Found", 404));
    }
    await job.deleteOne();
    res.status(200).json({
        success: true,
        message: "Job Deleted"
    });
});
export const getAJob = catchAsyncErrors(async(req, res, next)=>{
    const {id} = req.params;
    const job = await Job.findById(id);
    if(!job){
        return next(new ErrorHandler("Oops! Job Not Found", 404));
    }
    res.status(200).json({
        success:true,
        job
    });
});  


