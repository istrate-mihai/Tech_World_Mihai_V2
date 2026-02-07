<template>
    <main id="home">
        <div class="about__me">
            <div id="profile-image-container">
                <img :src="avatarImage" alt="personal-image" />
            </div>

            <h1>Istrate Mihai</h1>
            <h3>Web Developer</h3>

            <p>Thank you for being here.
            I am a person passionate about technology and solving problems. I like to contribute to
            a team of driven people and solve complex issues. I specialize in Fullstack Web Development mostly with Laravel and Vue.js,
            but also Node.js</p>

            <div class="skills_projects_link">
                <router-link to="/projects">Projects/Skills</router-link>
            </div>
        </div>
    </main>
</template>

<script setup>
import avatarImage from '@/assets/img/avatar.png';
</script>
