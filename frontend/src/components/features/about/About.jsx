import React from 'react';

import MemberCard from '../../ui/MemberCard';
import TeamCard from '../../ui/TeamCard';
import ProjectCard from '../Cards/ProjectCard';

import member1Pic from './../../../assets/images/racoon-pedro.gif'; 
import member2Pic from './../../../assets/images/racoon-pedro.gif'; 
import member3Pic from './../../../assets/images/racoon-pedro.gif'; 
import member4Pic from './../../../assets/images/racoon-pedro.gif'; 

const About = () => {
  return (
    <div className="bg-gray-100 py-10 m-20  bg-transparent backdrop-filter backdrop-blur-md backdrop-saturate-150 bg-opacity-20 transition duration-500 ">
      <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Team Section */}
          <div className='lg:w-max'>
            <h2 className="text-4xl font-bold text-white mb-8">Team</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TeamCard
                name="Via Eyes"
                teacher="Mudassir Saeed"
                assistant="Laiba Aslam"
              />
            </div>
          </div>
          
          {/* Project Section */}
          <div>
            <h2 className="text-4xl font-bold text-white mb-8">Project</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ProjectCard
                name="notMonkeyType"
                detail="typing speed Game Single / MutiPlayer"
                technologiesUsed="Vite,React,NodeJS,MongoDB,Spline"
                githubLink="https://github.com/shaafsalman/notMonkeyType.git"
              />
            </div>
          </div>
        </div>

        <h2 className="text-4xl font-bold text-white mb-8 mt-16">Team Members</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <MemberCard
            profilePic={member1Pic}
            name="Shaaf Salman"
            rollNumber="21L 6083"
            sectionBatch="2021 Batch"
            contactNumber="03174532990"
            email="L216083@lhr.nu.edu.pk"
          />
          <MemberCard
            profilePic={member2Pic}
            name="Haider Khan"
            rollNumber="21L-6067"
            sectionBatch="2021 Batch"
            email="L216067@lhr.nu.edu.pk"
          />
          <MemberCard
            profilePic={member3Pic}
            name="Mian Abdul Hadi"
            rollNumber="21L 6077"
            sectionBatch="2021 Batch"
            email="L216077@lhr.nu.edu.pk"
          />
          <MemberCard
            profilePic={member4Pic}
            name="Syed Farhan Jaffri"
            rollNumber="21L 6074"
            sectionBatch="2021 Batch"
            email="L216074@lhr.nu.edu.pk"
          />
        </div>
      </div>
    </div>
  );
};

export default About;
