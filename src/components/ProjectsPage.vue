<template>
    <div>
        <header id="site_header" class="container d_flex">
            <div class="bio__media">
                <div class="bio__media__text">
                    <h1>Istrate Mihai</h1>
                    <h3>Web Developer</h3>
                </div>
            </div>
            <nav>
                <router-link to='/'>Home</router-link>
                <a href="https://github.com/istrate-mihai" target="_blank">
                    <i class="fab fa-github fa-lg fa-fw"></i>
                </a>
            </nav>
        </header>

        <main class="container">
            <!-- Show Errors if the rest api doesn't work -->
            <div class="error" v-if="errors">
                Sorry! It seems we can't fetch data right now 😥
            </div>

            <!-- Else show the portfolio section -->
            <section id="portfolio" v-else>
                <div class="loading" v-if="loading">😴 Loading ... </div>

                <!-- Projects Grid -->
                <div class="projects-grid" v-else>
                    <div v-for="(project, projectKey) in projectsList" class="project-card" :key="projectKey">
                        <!-- Project Image/Thumbnail -->
                        <div class="project-thumbnail">
                            <div v-if="project.img" class="thumbnail-image">
                                <img :src="require('../assets/img/' + project.img)"
                                    :alt="project.prettyName || project.name"
                                    @error="handleImageError" />
                            </div>
                            <div v-else class="thumbnail-placeholder">
                                <i class="fas fa-code"></i>
                                <span>Project Preview</span>
                            </div>
                        </div>

                        <!-- Project Content -->
                        <div class="project-content">
                            <div class="project-header">
                                <h3 class="project-title">
                                    <a :href="project.website || project.html_url"
                                    target="_blank"
                                    class="project-link">
                                        {{ trimTitle(project.prettyName || project.name) }}
                                    </a>
                                </h3>

                                <!-- Language Badge -->
                                <div class="language-badge" v-if="project.language">
                                    {{ project.language }}
                                </div>
                            </div>

                            <!-- Description -->
                            <p class="project-description" v-if="project.description">
                                {{ trimText(project.description) }}
                            </p>
                            <p class="project-description no-desc" v-else>
                                No description provided
                            </p>

                            <!-- Project Meta Info -->
                            <div class="project-meta">
                                <div class="meta-item" v-if="project.stargazers_count !== undefined">
                                    <i class="fas fa-star"></i>
                                    <span>{{ project.stargazers_count }}</span>
                                </div>
                                <div class="meta-item" v-if="project.forks_count !== undefined">
                                    <i class="fas fa-code-branch"></i>
                                    <span>{{ project.forks_count }}</span>
                                </div>
                                <div class="meta-item">
                                    <i class="far fa-calendar-alt"></i>
                                    <span>{{ formatDate(project.updated_at) }}</span>
                                </div>
                            </div>

                            <!-- Action Buttons -->
                            <div class="project-actions">
                                <a v-if="project.website"
                                :href="project.website"
                                target="_blank"
                                class="btn btn-demo">
                                    <i class="fas fa-external-link-alt"></i> Live Demo
                                </a>
                                <a :href="project.html_url"
                                target="_blank"
                                class="btn btn-code">
                                    <i class="fab fa-github"></i> Code
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Load More Button -->
                <div class="load-more-container" v-if="!loading">
                    <div v-if="projectsList.length < projects.length">
                        <button class="btn_load_more" @click="loadMore()">
                            <i class="fas fa-plus"></i> Load More Projects
                        </button>
                    </div>
                    <div v-else>
                        <a href="https://github.com/istrate-mihai"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn-github">
                            <i class="fab fa-github"></i> Visit My GitHub
                        </a>
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>

<script>
import axios from 'axios';
import projectsLocalData from '@/data/projects';

export default {
    name: 'ProjectsPage',
    data() {
        return {
            projects: [],
            projectsList: null,
            skills: [],
            projectsCount: 5,
            perPage: 20,
            page: 1,
            loading: true,
            errors: false,
        }
    },
    methods: {
        fetchData: function () {
            axios
                .get(`https://api.github.com/users/istrate-mihai/repos?per_page=${this.perPage}&page=${this.page}`)
                .then(response => {
                    const additionalData = {
                        prettyName: '',
                        website: '',
                        img: '',
                    };

                    this.projects = response.data.map(project => {
                        if (projectsLocalData[project.name]) {
                            return {
                                ...project,
                                ...projectsLocalData[project.name]
                            }
                        }

                        return {
                            ...project,
                            ...additionalData,
                        };
                    });


                    this.projects.forEach(project => {
                        console.log('project', project);

                        if (project.language && !this.skills.includes(project.language)) {
                            this.skills.push(project.language);
                        }
                    });
                })
                .catch(error => {
                    console.log(error);
                    this.errors = true;
                })
                .finally(() => {
                    this.loading = false;
                    this.getProjects();
                });
        },
        getProjects: function () {
            this.projectsList = this.projects.slice(0, this.projectsCount);
            // console.log('projectsList', this.projectsList);
            
            return this.projectsList;
        },
        loadMore: function () {
            if (this.projectsList.length < this.projects.length) {
                this.projectsCount += 5;
                this.projectsList = this.projects.slice(0, this.projectsCount);
            }
        },
        handleImageError: function (event) {
            // Replace broken image with placeholder
            const parent = event.target.parentElement;
            parent.innerHTML =
                            `
                                <div class="thumbnail-placeholder">
                                    <i class="fas fa-code"></i>
                                    <span>Image not available</span>
                                </div>
                            `;
        },
        formatDate: function (dateString) {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        },
        trimTitle: function (text) {
            if (!text) return '';
            let title = text.replace(/[-_]/g, ' ');
            // Capitalize first letter of each word
            title = title.replace(/\b\w/g, l => l.toUpperCase());
            if (title.length > 25) {
                return title.slice(0, 25) + '...';
            }
            return title;
        },
        trimText: function (text) {
            if (!text) return '';
            if (text.length > 120) {
                return text.slice(0, 120) + '...';
            }
            return text;
        }
    },
    mounted() {
        setTimeout(this.fetchData, 3000);
    },
}   
</script>

<style></style>
