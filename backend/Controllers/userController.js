import {catchAsyncErrors} from "../Middlewares/catchAsyncErrors.js";
import ErrorHandler from "../Middlewares/ErrorMiddleWare.js";
import {User} from "../Models/userSchema.js"
import {v2 as cloudinary} from "cloudinary";
import {sendToken} from "../utils/jwt.js"

export const register = catchAsyncErrors(async(req, res, next)=>{
    try{
        const {
            name,
            email,
            phone,
            address,
            password,
            role,
            firstPreference,
            secondPreference,
            thirdPreference,
            coverLetter,
          } = req.body;
        if(!name || !email || !phone || !address || !password || !role){
            return next(new ErrorHandler("All fields are required" , 400));
        }
        if(role === "Job Seeker" && (!firstPreference || !secondPreference || !thirdPreference)){
            return next(new ErrorHandler("Please provide your job preferences" , 400));
        }
        const existingUser = await User.findOne({email});
        if(existingUser){
            return next(new ErrorHandler("User already exists",400));
        }
        const userData = {
            name , email , phone , address , password , role , preferences:{firstPreference , secondPreference , thirdPreference} , coverLetter
        };
        if(req.files && req.files.resume){
            const {resume} = req.files;
            if(resume){
                try{
                    const cloudinaryResponse = await cloudinary.uploader.upload(resume.tempFilePath,{folder: "Resume"});
                    if(!cloudinaryResponse || cloudinaryResponse.error){
                        return next(new ErrorHandler("Could not upload resume to clound." , 500));
                    }
                    userData.resume = {
                        public_id: cloudinaryResponse.public_id,
                        url: cloudinaryResponse.secure_url
                    }
                }
                catch(err){
                    return next(new ErrorHandler("Could not upload resumne" , 500));
                }
            }
        }
        const user = await User.create(userData);
        sendToken(user , 201, res, "User Registered");
        // res.status(201).json({
        //     success : true,
        //     message: "User registered"
        // });
    }
    catch(err){
        next(err);
    }
});

export const login = catchAsyncErrors(async(req , res, next)=>{
    const {role, email, password} = req.body;
    if(!role || !email || !password){
        return next(new ErrorHandler("All the fields are required",400));
    }
    const  user  = await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalid credentials!"),400);
    }
    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid credentials!", 400));
    }
    // console.log(user);
    if(user.role !== role){
        return next(new ErrorHandler("Invalid credentials!", 400));
    }
    sendToken(user, 200, res, "User Authenticated Succesfully!");
});

export const logout = catchAsyncErrors(async(req , res, next)=>{
    res.status(200).cookie("token", "", {
        expires: new Date(Date.now()),
        httpOnly: true
    }).json({
        success: true,
        message: "User logged out succesfully",
    })
});

export const getUser = catchAsyncErrors(async(req , res, next)=>{
    const user = req.user;
    res.status(200).json({
        success: true,
        user
    });
});

export const updateProfile = catchAsyncErrors(async(req , res, next)=>{
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        coverLetter: req.body.coverLetter,
        preferences: {
            firstPreference: req.body.firstPreference,
            secondPreference: req.body.secondPreference,
            thirdPreference: req.body.thirdPreference,
        }
    }
    const {firstPreference, secondPreference, thirdPreference} = newUserData.preferences;

    if(req.user.role === "Job Seeker" && (!firstPreference || !secondPreference || !thirdPreference)){
        return next(new ErrorHandler("Please provide your preferences", 400));
    }

    if(req.files){
       const resume = req.files.resume;
       if(resume){
        const currentFile = req.user.resume.public_id;
        if(currentFile){
            await cloudinary.uploader.destroy(currentFile);
        }
        const newResume = await cloudinary.uploader.upload(
            resume.tempFilePath,{
                folder: "Resume"
            });
        newUserData.resume = {
            public_id: newResume.public_id,
            url: newResume.secure_url,
        };
       } 
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success:true,
        user,
        message: "Profile Updated Succesfully",
    });

});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched =  await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched) {
        return next(new ErrorHandler("Current Password is incorrect"));
    }

    if(req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("New password and confirm password did not match", 400));
    }

    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 200, res, "Password Updated Succesfully");
})
 
