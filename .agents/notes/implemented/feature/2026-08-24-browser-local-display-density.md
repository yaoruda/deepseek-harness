# Agent Note: Browser-local display density

Status: implemented

English | [中文](2026-08-24-browser-local-display-density.zh.md)

## Problem

The desktop conversation metrics consume too much vertical and horizontal space on phone displays. Browser zoom is not a reliable product setting for an installed iOS Web application, and shrinking form controls below 16 CSS pixels triggers iOS focus zoom.

## Decision

The Web composition includes a client-only display-density plugin. It owns a validated browser-local preference with Standard, Compact, and Extra compact values, defaults phone-width viewports to Compact, and contributes its selector to General settings. The preference never enters Host settings, Session history, or model input.

The plugin projects one document attribute that selects shared density variables loaded by ui-theme. The conversation and Markdown owners consume those variables for assistant and user text, transcript rhythm, user bubbles, and assistant tables. Standard retains the existing metrics. The composer retains 16 px text in every preset, and manual viewport zoom remains enabled.

The selection is stored for one browser profile. Storage failures keep the in-memory selection usable, and malformed persisted values fall back to the viewport-derived default.

## Alternatives considered

**Global page scaling.** CSS zoom or a restrictive viewport scale would also shrink touch targets, maps, controls, and focus geometry, and would interfere with browser accessibility zoom.

**Host-backed density settings.** Server persistence would synchronize a phone-oriented choice onto desktop browsers. Display density describes one viewport and browser profile, so device-local storage matches its scope.

**Pure responsive CSS without a selector.** A fixed media-query choice would provide no escape hatch for eyesight, table-heavy work, or unusually sized devices.

## Consequences

Phone users see more conversation and table content without changing desktop defaults or model behavior. Each browser can override its width-derived first-run choice and retains that choice across reloads. The preference does not follow a user to another device, tool-specific presentations keep their own metrics, and crossing the breakpoint after activation does not silently replace the active selection.
