<template>
    <nav class="navbar">
        <router-link to="/">Play</router-link>
        <router-link to="/edit">Edit</router-link>
        <router-link to="/about">About</router-link>
    </nav>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
@Component
export default class NavBar extends Vue {
}
</script>

<style lang="scss" scoped>
.navbar {
    position: fixed;
    top: 0;
    left: 10px;
    color: var(--color-primary);
    background-color: var(--color-secondary);
    border: solid var(--color-primary) 5px;
    border-top: 0;
    padding: 10px;
    z-index: 5;

    a {
        color: var(--color-primary);
        text-decoration: underline;

        &.router-link-exact-active {
            color: var(--color-accent);
        }

        &:hover {
            text-decoration: none;
        }

        + a {
            margin-left: 10px;
        }
    }
}
</style>
