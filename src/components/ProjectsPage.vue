<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import projectsLocalData from '@/data/projects';

const projects             = ref([]);
const projectsList         = ref(null);
const skills               = ref([]);
const projectsCount        = ref(5);
const perPage              = ref(20);
const page                 = ref(1);
const loading              = ref(true);
const errors               = ref(false);
const projectsLocalDataRef = ref(projectsLocalData);

// Get all images from the assets/img folder
const images = import.meta.glob('@/assets/img/*', { eager: true })

const getImageUrl = (imageName) => {
  try {
    const imagePath   = `/src/assets/img/${imageName}`;
    const imageModule = images[imagePath];

    if (imageModule) {
      return imageModule.default || imageModule;
    }

    return '';
  }
  catch (error) {
    console.error('Error loading image:', error);
    return '';
  }
};

function getProjects() {
    projectsList.value = projects.value.slice(0, projectsCount.value);
    // console.log('projectsList', projectsList.value);

    return projectsList.value;
}

function loadMore() {
  if (projectsList.value.length < projects.value.length) {
    projectsCount.value += 5;
    projectsList.value  = projects.value.slice(0, projectsCount.value);
  }
}

function handleImageError(event) {
  // Replace broken image with placeholder
  const parent = event.target.parentElement;
  parent.innerHTML =
      `
          <div class="thumbnail-placeholder">
              <i class="fas fa-code"></i>
              <span>Image not available</span>
          </div>
      `;
};

async function fetchData() {
  loading.value = true;
  errors.value  = null;

  try {
    const response = await axios.get(
      `https://api.github.com/users/istrate-mihai/repos?per_page=${perPage.value}&page=${page.value}&sort=updated`
    );
    // Filter out personal website
    response.data = response.data.filter(repository => repository.name !== 'Tech_World_Mihai_V2');
    console.log(response.data);

    projects.value = response.data.map(project => {
      const additionalData = {
          prettyName: projectsLocalDataRef.value[project.name].prettyName ?? '',
          website: projectsLocalDataRef.value[project.name].website ?? '',
          img: projectsLocalDataRef.value[project.name].img ?? '',
          language: projectsLocalDataRef.value[project.name].language ?? project.language,
      };

      return {
        ...project,
        ...additionalData,
      };
    });

    projects.value.forEach(project => {
      // console.log('project', project);

      if (project.language && !skills.value.includes(project.language)) {
        skills.value.push(project.language);
      }
    });
  }
  catch(error) {
    console.log(error);
    errors.value = true;
  }
  finally {
    loading.value = false;
    getProjects();
  }
}

function formatDate(dateString) {
  const date     = new Date(dateString);
  const now      = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)   return `${diffDays} days ago`;
  if (diffDays < 30)  return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function trimTitle(text) {
  if (!text) return '';

  let title = text.replace(/[-_]/g, ' ');

  // Capitalize first letter of each word
  title = title.replace(/\b\w/g, l => l.toUpperCase());

  if (title.length > 25) return title.slice(0, 25) + '...';

  return title;
}

function trimText(text) {
  if (!text) return '';

  if (text.length > 120) return text.slice(0, 120) + '...';

  return text;
}

onMounted(() => {
    setTimeout(fetchData, 1000);
});
</script>

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
                                <img :src="getImageUrl(project.img)"
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
