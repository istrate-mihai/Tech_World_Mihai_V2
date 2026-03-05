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

      <div class="two-column">
        <ul id="projects-list">
          <li v-for="(appType, index) in appTypeList" :key="index">{{ appType }}</li>
        </ul>

        <div id="contact-details">
          <span>Contact Details:</span>
          <span>Telephone: (+40)799 556 693</span>
          <span>Email: i.mihai9960@gmail.com</span>
        </div>
      </div>

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
import { ref } from 'vue';

let appTypeList = ref([
  'Custom CRM or Dashboard',
  'Content Management System (CMS)',
  'E-commerce Platform',
  'Booking & Reservation System',
  'RESTful API',
  'Presentation / Business Website',
]);
</script>
