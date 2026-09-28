<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import projectsLocalData from '@/data/projects'
import AppFooter from './ui/AppFooter.vue'

const GITHUB_USER = 'istrate-mihai'
const PAGE_SIZE = 5
const REPOS_PER_REQUEST = 100 // GitHub API maximum
const MAX_REPO_REQUESTS = 5 // unauthenticated API: 60 requests/hour per visitor IP

// src/data/projects.js is the allowlist: only projects listed there are shown, in `position` order.
// GitHub only adds live data (code link, description, stars, forks, last push).
const projects = ref([])
const visibleCount = ref(PAGE_SIZE)
const loading = ref(true)
const errors = ref(false)

const projectsList = computed(() => projects.value.slice(0, visibleCount.value))

// Get all images from the assets/img folder
const images = import.meta.glob('@/assets/img/*', { eager: true })

const getImageUrl = (imageName) => {
  const imageModule = images[`/src/assets/img/${imageName}`]
  return imageModule ? imageModule.default || imageModule : ''
}

const isGithubUrl = (url) => /^https:\/\/github\.com\//i.test(url ?? '')

async function fetchPublicRepos() {
  const repos = []
  for (let page = 1; page <= MAX_REPO_REQUESTS; page += 1) {
    const { data } = await axios.get(`https://api.github.com/users/${GITHUB_USER}/repos`, {
      params: { per_page: REPOS_PER_REQUEST, page, type: 'owner' },
      headers: { Accept: 'application/vnd.github+json' },
    })
    repos.push(...data)
    if (data.length < REPOS_PER_REQUEST) break
  }
  return repos
}

function buildProjects(repos, reposLoaded) {
  const reposByName = new Map(repos.map((repo) => [repo.name.toLowerCase(), repo]))

  return Object.entries(projectsLocalData)
    .map(([name, local]) => {
      const repo = reposByName.get(name.toLowerCase())
      // A GitHub URL in `website` is a code link, not a live demo
      const demoUrl = local.website && !isGithubUrl(local.website) ? local.website : ''
      // Private repos are not returned by the API; if the API failed, fall back to the local GitHub URL
      const codeUrl = repo?.html_url ?? (!reposLoaded && isGithubUrl(local.website) ? local.website : '')

      return {
        name,
        prettyName: local.prettyName ?? '',
        img: local.img ?? '',
        language: local.language ?? repo?.language ?? '',
        position: local.position ?? Number.MAX_SAFE_INTEGER,
        description: local.description ?? repo?.description ?? '',
        website: demoUrl,
        html_url: codeUrl,
        stargazers_count: repo?.stargazers_count,
        forks_count: repo?.forks_count,
        updated_at: repo?.pushed_at ?? repo?.updated_at ?? null, // pushed_at = last code change
      }
    })
    .filter((project) => project.website || project.html_url) // e.g. a private repo with no demo stays hidden until it is public
    .sort((project1, project2) => project1.position - project2.position)
}

function loadMore() {
  visibleCount.value += PAGE_SIZE
}

function handleImageError(event) {
  // Replace broken image with placeholder
  const parent = event.target.parentElement
  parent.innerHTML = `
          <div class="thumbnail-placeholder">
              <i class="fas fa-code"></i>
              <span>Image not available</span>
          </div>
      `
}

async function fetchData() {
  loading.value = true
  errors.value = false

  let repos = []
  let reposLoaded = false
  try {
    repos = await fetchPublicRepos()
    reposLoaded = true
  } catch (error) {
    // Rate limit or network error: still render the local projects, just without GitHub stats
    console.warn('GitHub API unavailable, showing local project data only', error)
  }

  projects.value = buildProjects(repos, reposLoaded)
  errors.value = projects.value.length === 0
  loading.value = false
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function trimTitle(text) {
  if (!text) return ''

  let title = text.replace(/[-_]/g, ' ')

  // Capitalize first letter of each word
  title = title.replace(/\b\w/g, (l) => l.toUpperCase())

  if (title.length > 25) return title.slice(0, 25) + '...'

  return title
}

function trimText(text) {
  if (!text) return ''

  if (text.length > 120) return text.slice(0, 120) + '...'

  return text
}

onMounted(fetchData)
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
        <router-link to="/">Home</router-link>
        <a href="https://github.com/istrate-mihai" target="_blank">
          <i class="fab fa-github fa-lg fa-fw"></i>
        </a>
      </nav>
    </header>

    <main class="container">
      <!-- Show Errors if the rest api doesn't work -->
      <div class="error" v-if="errors">Sorry! It seems we can't fetch data right now 😥</div>

      <!-- Else show the portfolio section -->
      <section id="portfolio" v-else>
        <div class="loading" v-if="loading">😴 Loading ...</div>

        <!-- Projects Grid -->
        <div class="projects-grid" v-else>
          <div v-for="project in projectsList" class="project-card" :key="project.name">
            <!-- Project Image/Thumbnail -->
            <div class="project-thumbnail">
              <div v-if="project.img" class="thumbnail-image">
                <img
                  :src="getImageUrl(project.img)"
                  :alt="project.prettyName || project.name"
                  @error="handleImageError"
                />
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
                  <a
                    :href="project.website || project.html_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="project-link"
                  >
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
              <!--
                            <p class="project-description no-desc" v-else>
                                No description provided
                            </p>
                            -->
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
                <div class="meta-item" v-if="project.updated_at">
                  <i class="far fa-calendar-alt"></i>
                  <span>{{ formatDate(project.updated_at) }}</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="project-actions">
                <a
                  v-if="project.website"
                  :href="project.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-demo"
                >
                  <i class="fas fa-external-link-alt"></i> Live Demo
                </a>
                <a
                  v-if="project.html_url"
                  :href="project.html_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-code"
                >
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
            <a
              href="https://github.com/istrate-mihai"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-github"
            >
              <i class="fab fa-github"></i> Visit My GitHub
            </a>
          </div>
        </div>
      </section>

      <AppFooter />
    </main>
  </div>
</template>
