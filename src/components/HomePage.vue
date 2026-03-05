<template>
    <main id="home">
      <div class="about__me">
        <div id="profile-image-container">
            <img :src="avatarImage" alt="personal-image" />
        </div>

        <h1>Istrate Mihai</h1>
        <h3>Web Developer</h3>

        <p>
          I'm a Full-Stack Web Developer passionate about technology and problem-solving, specializing in the
          Laravel/LAMP stack and Vue.js, and I'm eager to collaborate on new projects. I can build:
        </p>

        <ul id="projects-list">
          <li>
            Custom CRM or Dashboard
          </li>
          <li>
            Content Management System (CMS)
          </li>
          <li>
            E-commerce Platform
          </li>
          <li>
            Booking & Reservation System
          </li>
          <li>
            RESTful API
          </li>
          <li>
            Presentation / Business Website
          </li>
        </ul>

        <div class="skills_projects_link">
          <router-link to="/projects">Projects/Skills</router-link>
        </div>

        <AppFooter />
      </div>
    </main>
</template>

<script setup>
import avatarImage from '@/assets/img/avatar.png';
import AppFooter from './ui/AppFooter.vue';
</script>
