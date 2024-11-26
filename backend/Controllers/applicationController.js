import {catchAsyncErrors} from "../Middlewares/catchAsyncErrors.js"
import ErrorHandler from "../Middlewares/ErrorMiddleWare.js"
import {Application} from "../Models/applicationSchema.js"
import {Job} from "../Models/jobSchema.js"
import {v2 as cloudinary} from "cloudinary";

export const postApplication = catchAsyncErrors(async(req , res, next)=>{
    const { id } = req.params;
    const {name, email, phone, address, coverLetter} = req.body; 

    if(!name || !email || !phone || !address || !coverLetter){
        return next(new ErrorHandler("Please fill all the required fields", 400));
    }
    const isAlreadyApplied = await Application.findOne({
        "jobInfo.jobId": id,
        "jobSeekerInfo.id": req.user._id
    });
    if(isAlreadyApplied){
        return next(new ErrorHandler("Already applied", 400));
    }
    const jobSeekerInfo = {
        id: req.user._id,
        name,
        email,
        phone,
        address,
        coverLetter,
        role: "Job Seeker",
    };
    const jobDetails = await Job.findById(id);
    if(!jobDetails){
        return next(new ErrorHandler("Job Opening does not exist", 404));
    }
    if(req.files && req.files.resume){
        const {resume} = req.files;
        try{
            const cloudinaryResponse = await cloudinary.uploader.upload(resume.tempFilePath, {folder: "Resume"});
            if(!cloudinaryResponse || cloudinaryResponse.error){
                return next(new ErrorHandler("Could not upload your resume. Please try again!", 500));
            }
            jobSeekerInfo.resume = {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url
            };
        }
        catch(err){
            return next(new ErrorHandler("Could not upload your resume. Please try again", 500));
        }
    }
    else{
        if(req.user && !req.user.resume.url){
            return next(new ErrorHandler("Please upload your resume", 500));
        }
        jobSeekerInfo.resume = {
            public_id: req.user && req.user.resume.public_id,
            url: req.user && req.user.resume.url,
        }
    }
    const employerInfo =  {
        id: jobDetails.postedBy,
        role: "Employer",
    }

    const jobInfo = {
        jobId: id,
        jobTitle: jobDetails.title,
    }

    const application = await Application.create({
        jobSeekerInfo,
        employerInfo,
        jobInfo
    });

    res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        application
    });
});

export const employerGetAllApplication = catchAsyncErrors(async(req , res, next)=>{
    const {_id} = req.user;
    const application = await Application.find({
        "employerInfo.id":_id,
        "deletedBy.employer": false,
    });
    res.status(200).json({
        success: true,
        application,
    });
});

export const jobSeekerGetAllApplication = catchAsyncErrors(async(req , res, next)=>{
    const {_id} = req.user;
    const application = await Application.find({
        "jobSeekerInfo.id":_id,
        "deletedBy.jobSeeker": false,
    });
    res.status(200).json({
        success: true,
        application,
    });
});

export const deleteApplication = catchAsyncErrors(async(req , res, next)=>{
    const { id } = req.params;
    const application = await Application.findById(id);
    if(!application){
        return next(new ErrorHandler("Application not found", 400));
    }
    const {role} = req.user;
    switch(role){
        case "Job Seeker":
            application.deletedBy.jobSeeker = true;
            await application.save();
            break;
        
        case "Employer":
            application.deletedBy.employer = true;
            await application.save();
            break;
    }

    if(application.deletedBy.employer === true && application.deletedBy.jobSeeker === true){
        await application.deleteOne();
    }

    res.status(200).json({
        success: true,
        message: "Application succesfully deleted",
    });
});